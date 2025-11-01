import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from './entidades/proyecto.endidad';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Rol } from '../usuarios/enums/rol.enum';


import { EtapaProyecto } from './enums/etapa-proyecto.enum';
import { AprobarEtapaDto } from './dto/aprobar-etapa.dto';
import { AccionTema, AccionTemaDto } from './dto/accion-tema.dto';
import { AvanceHistorial, HistorialProgresoDto, RevisionHistorial } from './dto/historial-progreso.dto';
import { CronogramaProyectoDto, EtapaCronograma } from './dto/cronograma-proyecto.dto';
import { BuscarProyectosDto, ResultadoBusqueda } from './dto/buscar-proyectos.dto';


@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly repositorio_proyecto: Repository<Proyecto>,
    @InjectRepository(Estudiante)
    private readonly repositorio_estudiante: Repository<Estudiante>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
  ) {}

  async crear(crear_proyecto_dto: CrearProyectoDto, id_usuario_estudiante: number) {
    const { id_asesor, titulo } = crear_proyecto_dto;

    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario_estudiante } },
      relations: ['grupo', 'grupo.asesor']
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID de usuario '${id_usuario_estudiante}' no encontrado.`);
    }

    let asesor: Asesor | null = null;

    if (estudiante.grupo && estudiante.grupo.asesor) {
      asesor = estudiante.grupo.asesor;
    } else if (id_asesor) {
      asesor = await this.repositorio_asesor.findOneBy({ id: id_asesor });
      if (!asesor) {
        throw new NotFoundException(`Asesor con ID '${id_asesor}' no encontrado.`);
      }
    } else {
      throw new BadRequestException('Debes estar inscrito en un grupo con asesor asignado o especificar un asesor para crear un proyecto.');
    }

    if (!asesor) {
      throw new BadRequestException('No se pudo determinar el asesor para el proyecto.');
    }

    // ✅ CORRECTO: solo asignamos 'asesor' (singular), NO 'estudiante'
    const nuevo_proyecto = this.repositorio_proyecto.create({
      titulo,
      asesor,
    });

    const proyecto_guardado = await this.repositorio_proyecto.save(nuevo_proyecto);

    // ✅ VINCULAMOS AL ESTUDIANTE AL PROYECTO (desde el lado del estudiante)
    estudiante.proyecto = proyecto_guardado;
    await this.repositorio_estudiante.save(estudiante);

    return proyecto_guardado;
  }

  async obtenerTodos(id_usuario: number, rol: string) {
    const query = this.repositorio_proyecto.createQueryBuilder('proyecto')
      .leftJoinAndSelect('proyecto.estudiantes', 'estudiante') // ✅ 'estudiantes' (plural)
      .leftJoinAndSelect('estudiante.usuario', 'usuario_estudiante') // opcional, si necesitas el usuario
      .leftJoinAndSelect('proyecto.asesor', 'asesor')
      .leftJoinAndSelect('proyecto.documentos', 'documentos')
      .orderBy('proyecto.fecha_creacion', 'DESC');

    if (rol === Rol.Estudiante) {
      const estudiante = await this.repositorio_estudiante.findOne({
        where: { usuario: { id: id_usuario } }
      });

      if (!estudiante) {
        throw new NotFoundException('Estudiante no encontrado.');
      }

      query.andWhere('estudiante.id = :estudianteId', { estudianteId: estudiante.id });
    } else if (rol === Rol.Asesor) {
      const asesor = await this.repositorio_asesor.findOne({
        where: { usuario: { id: id_usuario } }
      });

      if (!asesor) {
        throw new NotFoundException('Asesor no encontrado.');
      }

      query.andWhere('asesor.id = :asesorId', { asesorId: asesor.id });
    }

    return query.getMany();
  }

  async obtenerUno(id: number, id_usuario: number, rol: string) {
    const proyecto = await this.repositorio_proyecto.findOne({
      where: { id },
      relations: ['estudiantes', 'estudiantes.usuario', 'asesor', 'asesor.usuario'],
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID '${id}' no encontrado.`);
    }

    if (rol === Rol.Estudiante) {
      const esMiembroDelProyecto = proyecto.estudiantes?.some(
        estudiante => estudiante.usuario?.id === id_usuario
      );

      if (!esMiembroDelProyecto) {
        throw new ForbiddenException('No tienes permiso para acceder a este proyecto.');
      }
    } else if (rol === Rol.Asesor) {
      if (!proyecto.asesor || proyecto.asesor.usuario?.id !== id_usuario) {
        throw new ForbiddenException('No tienes permiso para acceder a este proyecto.');
      }
    }

    return proyecto;
  }

  
  async aprobarEtapa(id_proyecto: number, aprobarEtapaDto: AprobarEtapaDto, id_usuario_asesor: number) {
    const proyecto = await this.repositorio_proyecto.findOne({
      where: { id: id_proyecto },
      relations: ['asesor', 'asesor.usuario', 'estudiantes', 'estudiantes.usuario']
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id_proyecto} no encontrado`);
    }

    // Verificar que el usuario es el asesor del proyecto
    if (!proyecto.asesor || proyecto.asesor.usuario.id !== id_usuario_asesor) {
      throw new ForbiddenException('Solo el asesor asignado puede aprobar etapas del proyecto');
    }

    const { etapa, comentarios } = aprobarEtapaDto;
    const ahora = new Date();

    // Validar transición de etapas
    switch (etapa) {
      case EtapaProyecto.PROPUESTA:
        if (proyecto.propuesta_aprobada) {
          throw new BadRequestException('La propuesta ya ha sido aprobada');
        }
        proyecto.propuesta_aprobada = true;
        proyecto.fecha_aprobacion_propuesta = ahora;
        proyecto.comentario_aprobacion_propuesta = comentarios;
        // Avanzar a la siguiente etapa
        proyecto.etapa_actual = EtapaProyecto.PERFIL;
        break;

      case EtapaProyecto.PERFIL:
        if (!proyecto.propuesta_aprobada) {
          throw new BadRequestException('La propuesta debe ser aprobada antes del perfil');
        }
        if (proyecto.perfil_aprobado) {
          throw new BadRequestException('El perfil ya ha sido aprobado');
        }
        proyecto.perfil_aprobado = true;
        proyecto.fecha_aprobacion_perfil = ahora;
        proyecto.comentario_aprobacion_perfil = comentarios;
        proyecto.etapa_actual = EtapaProyecto.PROYECTO;
        break;

      case EtapaProyecto.PROYECTO:
        if (!proyecto.perfil_aprobado) {
          throw new BadRequestException('El perfil debe ser aprobado antes del proyecto final');
        }
        if (proyecto.proyecto_aprobado) {
          throw new BadRequestException('El proyecto ya ha sido aprobado');
        }
        proyecto.proyecto_aprobado = true;
        proyecto.fecha_aprobacion_proyecto = ahora;
        proyecto.comentario_aprobacion_proyecto = comentarios;
        // Proyecto completado
        break;

      default:
        throw new BadRequestException('Etapa no válida');
    }

    return this.repositorio_proyecto.save(proyecto);
  }


  async gestionarTemaPropuesto(id_proyecto: number, accionTemaDto: AccionTemaDto, id_usuario_asesor: number) {
    const proyecto = await this.repositorio_proyecto.findOne({
      where: { id: id_proyecto },
      relations: ['asesor', 'asesor.usuario', 'estudiantes', 'estudiantes.usuario']
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id_proyecto} no encontrado`);
    }

    // Verificar que el usuario es el asesor del proyecto
    if (!proyecto.asesor || proyecto.asesor.usuario.id !== id_usuario_asesor) {
      throw new ForbiddenException('Solo el asesor asignado puede gestionar el tema propuesto');
    }

    // Verificar que el tema aún no ha sido aprobado
    if (proyecto.propuesta_aprobada) {
      throw new BadRequestException('El tema ya ha sido aprobado, no se puede modificar');
    }

    const { accion, comentarios } = accionTemaDto;
    const ahora = new Date();

    if (accion === AccionTema.APROBAR) {
      proyecto.propuesta_aprobada = true;
      proyecto.fecha_aprobacion_propuesta = ahora;
      proyecto.comentario_aprobacion_propuesta = comentarios;
      proyecto.etapa_actual = EtapaProyecto.PERFIL;
    } else if (accion === AccionTema.RECHAZAR) {
      // Para rechazar, simplemente registramos el comentario
      // y mantenemos propuesta_aprobada = false
      proyecto.comentario_aprobacion_propuesta = comentarios;
      // La etapa_actual permanece como PROPUESTA
    }

    return this.repositorio_proyecto.save(proyecto);
  }

  async obtenerHistorialProgreso(id_usuario_estudiante: number): Promise<HistorialProgresoDto> {
    // 1. Obtener el estudiante
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario_estudiante } },
      relations: ['proyecto', 'proyecto.asesor', 'proyecto.documentos']
    });

    if (!estudiante || !estudiante.proyecto) {
      throw new NotFoundException('No tienes un proyecto asignado');
    }

    const proyecto = estudiante.proyecto;

    // 2. Construir historial de avances
    const avances: AvanceHistorial[] = [
      {
        etapa: 'propuesta',
        estado: proyecto.propuesta_aprobada ? 'aprobado' : 'pendiente',
        fecha: proyecto.fecha_aprobacion_propuesta,
        comentarios: proyecto.comentario_aprobacion_propuesta
      },
      {
        etapa: 'perfil',
        estado: proyecto.perfil_aprobado ? 'aprobado' : 'pendiente',
        fecha: proyecto.fecha_aprobacion_perfil,
        comentarios: proyecto.comentario_aprobacion_perfil
      },
      {
        etapa: 'proyecto',
        estado: proyecto.proyecto_aprobado ? 'aprobado' : 'pendiente',
        fecha: proyecto.fecha_aprobacion_proyecto,
        comentarios: proyecto.comentario_aprobacion_proyecto
      }
    ];

    // 3. Obtener observaciones del proyecto
    const observaciones = await this.repositorio_proyecto
      .createQueryBuilder('proyecto')
      .innerJoinAndSelect('proyecto.documentos', 'documento')
      .innerJoinAndSelect('documento.observaciones', 'observacion')
      .innerJoinAndSelect('observacion.autor', 'autor')
      .where('proyecto.id = :proyectoId', { proyectoId: proyecto.id })
      .getMany();

    // 4. Construir historial de revisiones
    const revisiones: RevisionHistorial[] = [];
    for (const doc of proyecto.documentos || []) {
      for (const obs of doc.observaciones || []) {
        revisiones.push({
          id: obs.id,
          titulo: obs.titulo || 'Observación sin título',
          estado: obs.estado as any,
          fecha_creacion: obs.fecha_creacion,
          fecha_verificacion: obs.fecha_verificacion,
          documento: doc.nombre_archivo,
          version_observada: obs.version_observada,
          version_corregida: obs.version_corregida,
          comentarios_asesor: obs.comentarios_asesor,
          comentario_verificacion: obs.comentario_verificacion
        });
      }
    }

    // 5. Construir información de defensa
    const defensa = {
      completada: proyecto.proyecto_aprobado,
      fecha: proyecto.fecha_aprobacion_proyecto,
      comentarios: proyecto.comentario_aprobacion_proyecto
    };

    return { avances, revisiones, defensa };
  }
  

  async obtenerCronogramaProyecto(id_usuario_estudiante: number): Promise<CronogramaProyectoDto> {
    // 1. Obtener el estudiante con relaciones completas
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario_estudiante } },
      relations: ['proyecto', 'proyecto.asesor', 'grupo', 'grupo.periodo']
    });

    if (!estudiante || !estudiante.proyecto || !estudiante.grupo?.periodo) {
      throw new NotFoundException('No tienes un proyecto asignado con período académico');
    }

    const proyecto = estudiante.proyecto;
    const periodo = estudiante.grupo.periodo;
    const hoy = new Date();

    // 2. Función auxiliar para calcular días restantes
    const calcularDiasRestantes = (fechaLimite: Date | null): number | null => {
      if (!fechaLimite) return null;
      const diffTime = fechaLimite.getTime() - hoy.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // 3. Construir cronograma por etapas
    const etapas: EtapaCronograma[] = [
      {
        nombre: 'propuesta',
        fecha_limite_entrega: periodo.fecha_limite_propuesta || null,
        estado: proyecto.propuesta_aprobada 
          ? 'aprobado' 
          : (periodo.fecha_limite_propuesta && hoy > periodo.fecha_limite_propuesta) 
            ? 'vencido' 
            : 'pendiente',
        dias_restantes: calcularDiasRestantes(periodo.fecha_limite_propuesta || null),
        recomendaciones: []
      },
      {
        nombre: 'perfil',
        fecha_limite_entrega: periodo.fecha_limite_perfil || null,
        estado: proyecto.perfil_aprobado 
          ? 'aprobado' 
          : (periodo.fecha_limite_perfil && hoy > periodo.fecha_limite_perfil) 
            ? 'vencido' 
            : 'pendiente',
        dias_restantes: calcularDiasRestantes(periodo.fecha_limite_perfil || null),
        recomendaciones: []
      },
      {
        nombre: 'proyecto',
        fecha_limite_entrega: periodo.fecha_limite_proyecto || null,
        estado: proyecto.proyecto_aprobado 
          ? 'aprobado' 
          : (periodo.fecha_limite_proyecto && hoy > periodo.fecha_limite_proyecto) 
            ? 'vencido' 
            : 'pendiente',
        dias_restantes: calcularDiasRestantes(periodo.fecha_limite_proyecto || null),
        recomendaciones: []
      }
    ];

    // 4. Agregar recomendaciones según la etapa actual
    const etapaActual = proyecto.etapa_actual;
    switch (etapaActual) {
      case EtapaProyecto.PROPUESTA:
        etapas[0].recomendaciones = [
          `Tienes ${etapas[0].dias_restantes || 'N/A'} días para entregar la propuesta`,
          `El asesor tendrá ${periodo.dias_revision_asesor} días para revisar tu propuesta`,
          `Si es rechazada, tendrás ${periodo.dias_correccion_estudiante} días para corregir`
        ];
        break;
      case EtapaProyecto.PERFIL:
        etapas[1].recomendaciones = [
          `Tienes ${etapas[1].dias_restantes || 'N/A'} días para entregar el perfil`,
          `Asegúrate de haber corregido todas las observaciones de la propuesta`,
          `El perfil debe incluir la metodología detallada`
        ];
        break;
      case EtapaProyecto.PROYECTO:
        etapas[2].recomendaciones = [
          `Tienes ${etapas[2].dias_restantes || 'N/A'} días para entregar el proyecto final`,
          `Prepárate para la defensa privada y pública`,
          `Revisa todas las correcciones pendientes`
        ];
        break;
    }

    return {
      periodo: {
        nombre: periodo.nombre,
        fecha_inicio: periodo.fecha_inicio_semestre,
        fecha_fin: periodo.fecha_fin_semestre
      },
      etapas,
      etapa_actual: etapaActual
    };
  }
  

  async buscarProyectos(
    buscarDto: BuscarProyectosDto,
    id_usuario_estudiante: number
  ): Promise<ResultadoBusqueda[]> {
    // 1. Verificar que el usuario es estudiante
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario_estudiante } }
    });

    if (!estudiante) {
      throw new ForbiddenException('Solo los estudiantes pueden buscar en el repositorio');
    }

    // 2. Construir query con TypeORM
    const query = this.repositorio_proyecto
      .createQueryBuilder('proyecto')
      .leftJoinAndSelect('proyecto.estudiantes', 'estudiante')
      .leftJoinAndSelect('estudiante.usuario', 'usuario_estudiante')
      .leftJoinAndSelect('proyecto.asesor', 'asesor')
      .leftJoinAndSelect('asesor.usuario', 'usuario_asesor')
      .where('proyecto.proyecto_aprobado = :aprobado', { aprobado: true }); // Solo proyectos aprobados

    // 3. Aplicar filtros
    if (buscarDto.soloAprobados !== undefined) {
      query.andWhere('proyecto.proyecto_aprobado = :soloAprobados', { 
        soloAprobados: buscarDto.soloAprobados 
      });
    }

    if (buscarDto.etapa) {
      query.andWhere('proyecto.etapa_actual = :etapa', { etapa: buscarDto.etapa });
    }

    if (buscarDto.periodoId) {
      query
        .innerJoin('estudiante.grupo', 'grupo')
        .andWhere('grupo.periodo_id = :periodoId', { periodoId: buscarDto.periodoId });
    }

    // 4. Aplicar búsqueda por término (búsqueda simple con LIKE)
    if (buscarDto.termino) {
      const termino = `%${buscarDto.termino.toLowerCase()}%`;
      query.andWhere(
        `(LOWER(proyecto.titulo) LIKE :termino OR 
          LOWER(proyecto.resumen) LIKE :termino OR 
          proyecto.palabras_clave && ARRAY[:palabra]::text[])`,
        { 
          termino, 
          palabra: buscarDto.termino.toLowerCase() 
        }
      );
    }

    // 5. Ordenar por relevancia y fecha
    query.orderBy('proyecto.proyecto_aprobado', 'DESC')
        .addOrderBy('proyecto.fecha_creacion', 'DESC');

    const proyectos = await query.getMany();

    // 6. Formatear resultados
    return proyectos.map(proyecto => ({
      id: proyecto.id,
      titulo: proyecto.titulo,
      resumen: proyecto.resumen,
      palabras_clave: proyecto.palabras_clave,
      autor: proyecto.estudiantes?.[0]?.nombre 
      ? `${proyecto.estudiantes[0].nombre} ${proyecto.estudiantes[0].apellido}`
      : 'Autor desconocido',
      fecha_creacion: proyecto.fecha_creacion,
      etapa_actual: proyecto.etapa_actual,
      proyecto_aprobado: proyecto.proyecto_aprobado
    }));
  }
}