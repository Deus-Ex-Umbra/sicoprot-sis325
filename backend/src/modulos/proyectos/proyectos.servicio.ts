import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { Proyecto } from './entidades/proyecto.endidad';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Rol } from '../usuarios/enums/rol.enum';
import { Grupo } from '../grupos/entidades/grupo.entidad';
import { Periodo } from '../periodos/entidades/periodo.entidad';
import { EtapaProyecto } from './enums/etapa-proyecto.enum';
import { AprobarEtapaDto } from './dto/aprobar-etapa.dto';
import { AccionTema, AccionTemaDto } from './dto/accion-tema.dto';
import { AvanceHistorial, HistorialProgresoDto, RevisionHistorial } from './dto/historial-progreso.dto';
import { CronogramaProyectoDto, EtapaCronograma } from './dto/cronograma-proyecto.dto';
import { BuscarProyectosDto, ResultadoBusqueda } from './dto/buscar-proyectos.dto';
import { Reunion } from '../reuniones/entidades/reunion.entidad';
import { Documento } from '../documentos/entidades/documento.entidad';
import { Observacion } from '../observaciones/entidades/observacion.entidad';
import { Correccion } from '../correcciones/entidades/correccion.entidad';
import { TimelineCompletoDto } from './dto/timeline-completo.dto';
import { SolicitarDefensaDto } from './dto/solicitar-defensa.dto';
import { ResponderSolicitudDefensaDto } from './dto/responder-solicitud-defensa.dto';
import { Usuario } from '../usuarios/entidades/usuario.entidad';
import { GruposService } from '../grupos/grupos.servicio';
import { ActualizarPropuestaDto } from './dto/actualizar-propuesta.dto';
import { ObservacionesService } from '../observaciones/observaciones.servicio';
import { TipoGrupo } from '../grupos/enums/tipo-grupo.enum';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly repositorio_proyecto: Repository<Proyecto>,
    @InjectRepository(Estudiante)
    private readonly repositorio_estudiante: Repository<Estudiante>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
    @InjectRepository(Periodo)
    private readonly repositorio_periodo: Repository<Periodo>,
    @InjectRepository(Reunion)
    private readonly repositorio_reunion: Repository<Reunion>,
    @InjectRepository(Documento)
    private readonly repositorio_documento: Repository<Documento>,
    @InjectRepository(Observacion)
    private readonly repositorio_observacion: Repository<Observacion>,
    @InjectRepository(Usuario)
    private readonly repositorio_usuario: Repository<Usuario>,
    @InjectRepository(Grupo)
    private readonly repositorio_grupo: Repository<Grupo>,
    private readonly servicio_grupos: GruposService,
    private readonly servicio_observaciones: ObservacionesService,
  ) {}

  async crear(crear_proyecto_dto: CrearProyectoDto, id_usuario_estudiante: number) {
    const { id_asesor, titulo, cuerpo_html } = crear_proyecto_dto;

    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario_estudiante } },
      relations: ['grupos', 'grupos.asesor', 'grupos.periodo', 'proyecto']
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID de usuario '${id_usuario_estudiante}' no encontrado.`);
    }

    if (estudiante.proyecto) {
      throw new BadRequestException('Ya tienes un proyecto asignado. No puedes crear otro.');
    }

    let asesor: Asesor | null = null;
    const grupo_activo = estudiante.grupos.find(g => g.periodo.activo);

    if (grupo_activo && grupo_activo.asesor) {
      asesor = grupo_activo.asesor;
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

    const nuevo_proyecto = this.repositorio_proyecto.create({
      titulo,
      cuerpo_html,
      asesor,
    });

    const proyecto_guardado = await this.repositorio_proyecto.save(nuevo_proyecto);

    estudiante.proyecto = proyecto_guardado;
    await this.repositorio_estudiante.save(estudiante);

    return proyecto_guardado;
  }

  async obtenerTodos(id_usuario: number, rol: string) {
    const query = this.repositorio_proyecto.createQueryBuilder('proyecto')
      .leftJoinAndSelect('proyecto.estudiantes', 'estudiante') 
      .leftJoinAndSelect('estudiante.usuario', 'usuario_estudiante') 
      .leftJoinAndSelect('proyecto.asesor', 'asesor')
      .leftJoinAndSelect('asesor.usuario', 'usuario_asesor')
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
      
      query.andWhere('proyecto.etapa_actual != :etapaTerminado', { 
        etapaTerminado: EtapaProyecto.TERMINADO 
      });
      
      const grupos_activos_asesor = await this.repositorio_grupo.find({
        where: { asesor: { id: asesor.id }, periodo: { activo: true } },
      });

      const es_asesor_tgi = grupos_activos_asesor.some(g => g.tipo === TipoGrupo.TALLER_GRADO_I);
      const es_asesor_tgii = grupos_activos_asesor.some(g => g.tipo === TipoGrupo.TALLER_GRADO_II);

      const etapas_visibles: EtapaProyecto[] = [];
      if (es_asesor_tgi) {
        etapas_visibles.push(EtapaProyecto.PROPUESTA, EtapaProyecto.PERFIL);
      }
      if (es_asesor_tgii) {
        etapas_visibles.push(EtapaProyecto.PROYECTO, EtapaProyecto.LISTO_DEFENSA, EtapaProyecto.SOLICITUD_DEFENSA);
      }

      if (etapas_visibles.length > 0) {
        query.andWhere('proyecto.etapa_actual IN (:...etapas_visibles)', { etapas_visibles });
      } else {
        query.andWhere('1=0');
      }
    }

    return query.getMany();
  }

  async obtenerUno(id: number, id_usuario: number, rol: string) {
    const proyecto = await this.repositorio_proyecto.findOne({
      where: { id },
      relations: [
        'estudiantes', 
        'estudiantes.usuario', 
        'estudiantes.grupos', 
        'estudiantes.grupos.periodo',
        'asesor', 
        'asesor.usuario', 
        'documentos', 
        'reuniones', 
        'observaciones'
      ],
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID '${id}' no encontrado.`);
    }

    if (proyecto.etapa_actual === EtapaProyecto.TERMINADO) {
      const esActorInvolucrado = 
        (rol === Rol.Estudiante && proyecto.estudiantes?.some(e => e.usuario?.id === id_usuario)) ||
        (rol === Rol.Asesor && proyecto.asesor?.usuario?.id === id_usuario) ||
        rol === Rol.Administrador;

      if (!esActorInvolucrado) {
        const proyectoPublico = await this.repositorio_proyecto.findOne({
          where: { id: id, etapa_actual: EtapaProyecto.TERMINADO },
          relations: [
            'estudiantes', 
            'estudiantes.usuario',
            'asesor', 
            'asesor.usuario', 
            'documentos'
          ],
        });
        
        if (!proyectoPublico) {
            throw new ForbiddenException('No tienes permiso para acceder a este proyecto.');
        }

        proyectoPublico.documentos = proyectoPublico.documentos?.filter(
            doc => doc.ruta_archivo !== proyectoPublico.ruta_memorial
        );
        
        return proyectoPublico;
      }
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
        
        const asesor_actual_grupos = await this.repositorio_grupo.count({
          where: {
            asesor: { usuario: { id: id_usuario } },
            periodo: { activo: true },
            tipo: TipoGrupo.TALLER_GRADO_II,
          }
        });

        if (asesor_actual_grupos > 0 && proyecto.etapa_actual === EtapaProyecto.PROYECTO) {
        } else {
          throw new ForbiddenException('No tienes permiso para acceder a este proyecto.');
        }
      }
    } else if (rol !== Rol.Administrador) {
       throw new ForbiddenException('No tienes permiso para acceder a este proyecto.');
    }

    if (proyecto.documentos) {
      proyecto.documentos.sort((a, b) => b.version - a.version);
    }

    return proyecto;
  }

  
  async aprobarEtapa(id_proyecto: number, aprobar_etapa_dto: AprobarEtapaDto, id_usuario_asesor: number) {
    const proyecto = await this.repositorio_proyecto.findOne({
      where: { id: id_proyecto },
      relations: ['asesor', 'asesor.usuario', 'estudiantes', 'estudiantes.usuario', 'documentos']
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id_proyecto} no encontrado`);
    }

    if (!proyecto.asesor || proyecto.asesor.usuario.id !== id_usuario_asesor) {
      throw new ForbiddenException('Solo el asesor asignado puede aprobar etapas del proyecto');
    }
    
    const observaciones_pendientes = await this.servicio_observaciones.contarObservacionesPendientes(
        id_proyecto,
        proyecto.etapa_actual
    );

    if (observaciones_pendientes > 0) {
        throw new BadRequestException(`No se puede aprobar la etapa. Existen ${observaciones_pendientes} observaciones pendientes.`);
    }

    const { etapa, comentarios } = aprobar_etapa_dto;
    const ahora = new Date();

    switch (etapa) {
      case EtapaProyecto.PROPUESTA:
        if (proyecto.propuesta_aprobada) {
          throw new BadRequestException('La propuesta ya ha sido aprobada');
        }
        proyecto.propuesta_aprobada = true;
        proyecto.fecha_aprobacion_propuesta = ahora;
        proyecto.comentario_aprobacion_propuesta = comentarios;
        proyecto.etapa_actual = EtapaProyecto.PERFIL;
        break;

      case EtapaProyecto.PERFIL:
        if (!proyecto.propuesta_aprobada) {
          throw new BadRequestException('La propuesta debe ser aprobada antes del perfil');
        }
        if (proyecto.perfil_aprobado) {
          throw new BadRequestException('El perfil ya ha sido aprobado');
        }
        
        const tiene_documentos = proyecto.documentos && proyecto.documentos.length > 0;
        if (!tiene_documentos) {
          throw new BadRequestException('No se puede aprobar un perfil sin un documento subido.');
        }

        proyecto.perfil_aprobado = true;
        proyecto.fecha_aprobacion_perfil = ahora;
        proyecto.comentario_aprobacion_perfil = comentarios;
        proyecto.etapa_actual = EtapaProyecto.PROYECTO;
        if (proyecto.estudiantes && proyecto.estudiantes.length > 0) {
          for (const estudiante of proyecto.estudiantes) {
            await this.servicio_grupos.desinscribirEstudianteDeGrupoActivo(estudiante.id);
          }
        }
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
        proyecto.etapa_actual = EtapaProyecto.LISTO_DEFENSA;
        proyecto.listo_para_defender = true;
        break;

      default:
        throw new BadRequestException('Etapa no válida');
    }

    return this.repositorio_proyecto.save(proyecto);
  }


  async gestionarTemaPropuesto(id_proyecto: number, accion_tema_dto: AccionTemaDto, id_usuario_asesor: number) {
    const proyecto = await this.repositorio_proyecto.findOne({
      where: { id: id_proyecto },
      relations: ['asesor', 'asesor.usuario', 'estudiantes', 'estudiantes.usuario']
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id_proyecto} no encontrado`);
    }

    if (!proyecto.asesor || proyecto.asesor.usuario.id !== id_usuario_asesor) {
      throw new ForbiddenException('Solo el asesor asignado puede gestionar el tema propuesto');
    }

    const { accion, comentarios } = accion_tema_dto;
    const ahora = new Date();

    if (accion === AccionTema.APROBAR) {
      if (proyecto.propuesta_aprobada) {
        throw new BadRequestException('La propuesta ya ha sido aprobada');
      }
      proyecto.propuesta_aprobada = true;
      proyecto.fecha_aprobacion_propuesta = ahora;
      proyecto.comentario_aprobacion_propuesta = comentarios;
      proyecto.etapa_actual = EtapaProyecto.PERFIL;
    } else if (accion === AccionTema.RECHAZAR) {
      proyecto.propuesta_aprobada = false;
      proyecto.fecha_aprobacion_propuesta = undefined;
      proyecto.comentario_aprobacion_propuesta = comentarios;
      proyecto.etapa_actual = EtapaProyecto.PROPUESTA;
    }

    return this.repositorio_proyecto.save(proyecto);
  }

  async actualizarPropuesta(id_proyecto: number, dto: ActualizarPropuestaDto, id_usuario_estudiante: number) {
    const proyecto = await this.repositorio_proyecto.findOne({
      where: { id: id_proyecto },
      relations: ['estudiantes', 'estudiantes.usuario']
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id_proyecto} no encontrado`);
    }

    const esEstudianteDelProyecto = proyecto.estudiantes.some(e => e.usuario.id === id_usuario_estudiante);
    if (!esEstudianteDelProyecto) {
      throw new ForbiddenException('No tienes permiso para editar este proyecto.');
    }

    if (proyecto.etapa_actual !== EtapaProyecto.PROPUESTA || proyecto.propuesta_aprobada) {
      throw new BadRequestException('Solo se puede editar una propuesta que esté en etapa "propuesta" y no haya sido aprobada.');
    }

    if (dto.titulo) {
      proyecto.titulo = dto.titulo;
    }
    if (dto.cuerpo_html) {
      proyecto.cuerpo_html = dto.cuerpo_html;
    }

    return this.repositorio_proyecto.save(proyecto);
  }

  async obtenerHistorialProgreso(id_usuario_estudiante: number): Promise<HistorialProgresoDto> {
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario_estudiante } },
      relations: ['proyecto', 'proyecto.asesor', 'proyecto.documentos']
    });

    if (!estudiante || !estudiante.proyecto) {
      throw new NotFoundException('No tienes un proyecto asignado');
    }

    const proyecto = estudiante.proyecto;

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

    const observaciones = await this.repositorio_observacion.find({
      where: [
        { documento: { proyecto: { id: proyecto.id } } },
        { proyecto: { id: proyecto.id } }
      ],
      relations: ['documento', 'autor', 'correcciones'],
      order: { fecha_creacion: 'ASC' }
    });

    const revisiones: RevisionHistorial[] = observaciones.map(obs => ({
      id: obs.id,
      titulo: obs.titulo || 'Observación sin título',
      estado: obs.estado as any,
      etapa_observada: obs.etapa_observada,
      fecha_creacion: obs.fecha_creacion,
      fecha_verificacion: obs.fecha_verificacion,
      documento: obs.documento ? obs.documento.nombre_archivo : 'Observación de Proyecto',
      version_observada: obs.version_observada,
      version_corregida: obs.version_corregida,
      comentarios_asesor: obs.comentarios_asesor_html,
      comentario_verificacion: obs.comentario_verificacion_html
    }));

    const defensa = {
      completada: proyecto.etapa_actual === EtapaProyecto.TERMINADO,
      fecha: proyecto.fecha_aprobacion_proyecto,
      comentarios: proyecto.comentarios_defensa
    };

    return { avances, revisiones, defensa };
  }
  

  async obtenerCronogramaProyecto(id_usuario_estudiante: number): Promise<CronogramaProyectoDto> {
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario_estudiante } },
      relations: ['proyecto', 'proyecto.asesor', 'grupos', 'grupos.periodo']
    });
  
    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    
    const grupo_activo = estudiante.grupos.find(g => g.periodo?.activo);
  
    if (!grupo_activo) {
      throw new NotFoundException('No estás inscrito en un grupo con un período académico activo');
    }
  
    const proyecto = estudiante.proyecto;
    const grupo = grupo_activo;
    const periodo = grupo.periodo;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
  
    const calcularDiasRestantes = (fechaLimite?: Date | null): number | null => {
      if (!fechaLimite) return null;
      const fecha_lim = new Date(fechaLimite);
      fecha_lim.setHours(23, 59, 59, 999);
      if (hoy > fecha_lim) {
        return 0;
      }
      const diffTime = fecha_lim.getTime() - hoy.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
  
    const etapas: EtapaCronograma[] = [
      {
        nombre: 'propuesta',
        fecha_limite_entrega: grupo.fecha_limite_propuesta || null,
        estado: proyecto?.propuesta_aprobada 
          ? 'aprobado' 
          : (grupo.fecha_limite_propuesta && hoy > new Date(grupo.fecha_limite_propuesta)) 
            ? 'vencido' 
            : 'pendiente',
        dias_restantes: calcularDiasRestantes(grupo.fecha_limite_propuesta),
        recomendaciones: []
      },
      {
        nombre: 'perfil',
        fecha_limite_entrega: grupo.fecha_limite_perfil || null,
        estado: proyecto?.perfil_aprobado 
          ? 'aprobado' 
          : (grupo.fecha_limite_perfil && hoy > new Date(grupo.fecha_limite_perfil)) 
            ? 'vencido' 
            : 'pendiente',
        dias_restantes: calcularDiasRestantes(grupo.fecha_limite_perfil),
        recomendaciones: []
      },
      {
        nombre: 'proyecto',
        fecha_limite_entrega: grupo.fecha_limite_proyecto || null,
        estado: proyecto?.proyecto_aprobado 
          ? 'aprobado' 
          : (grupo.fecha_limite_proyecto && hoy > new Date(grupo.fecha_limite_proyecto)) 
            ? 'vencido' 
            : 'pendiente',
        dias_restantes: calcularDiasRestantes(grupo.fecha_limite_proyecto),
        recomendaciones: []
      }
    ];
  
    const etapaActual = proyecto?.etapa_actual || EtapaProyecto.PROPUESTA;
    switch (etapaActual) {
      case EtapaProyecto.PROPUESTA:
        etapas[0].recomendaciones = [
          `Tienes ${etapas[0].dias_restantes ?? 'N/A'} días para entregar la propuesta`,
          `El asesor tendrá ${grupo.dias_revision_asesor} días para revisar tu propuesta`,
          `Si es rechazada, tendrás ${grupo.dias_correccion_estudiante} días para corregir`
        ];
        break;
      case EtapaProyecto.PERFIL:
        etapas[1].recomendaciones = [
          `Tienes ${etapas[1].dias_restantes ?? 'N/A'} días para entregar el perfil`,
          `Asegúrate de haber corregido todas las observaciones de la propuesta`,
          `El perfil debe incluir la metodología detallada`
        ];
        break;
      case EtapaProyecto.PROYECTO:
        etapas[2].recomendaciones = [
          `Tienes ${etapas[2].dias_restantes ?? 'N/A'} días para entregar el proyecto final`,
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
    buscar_dto: BuscarProyectosDto,
    id_usuario: number,
    rol: Rol
  ): Promise<ResultadoBusqueda[]> {

    const query = this.repositorio_proyecto
      .createQueryBuilder('proyecto')
      .leftJoinAndSelect('proyecto.estudiantes', 'estudiante')
      .leftJoinAndSelect('estudiante.usuario', 'usuario_estudiante')
      .leftJoinAndSelect('proyecto.asesor', 'asesor_busqueda')
      .leftJoinAndSelect('asesor_busqueda.usuario', 'usuario_asesor')
      .leftJoin('estudiante.grupos', 'grupo')
      .leftJoin('grupo.periodo', 'periodo');

    if (buscar_dto.soloAprobados === true) {
      query.andWhere('proyecto.etapa_actual = :etapaTerminado', { 
        etapaTerminado: EtapaProyecto.TERMINADO
      });
    }

    if (buscar_dto.etapa) {
      query.andWhere('proyecto.etapa_actual = :etapa', { etapa: buscar_dto.etapa });
    }

    if (buscar_dto.periodoId) {
      query.andWhere('periodo.id = :periodoId', { periodoId: buscar_dto.periodoId });
    }

    if (buscar_dto.anio) {
      query.andWhere('EXTRACT(YEAR FROM proyecto.fecha_creacion) = :anio', { anio: parseInt(buscar_dto.anio, 10) });
    }

    if (buscar_dto.carrera) {
      query.andWhere('LOWER(grupo.carrera) LIKE :carrera', { carrera: `%${buscar_dto.carrera.toLowerCase()}%` });
    }
    
    if (buscar_dto.asesorId) {
      query.andWhere('asesor_busqueda.id = :asesorId', { asesorId: parseInt(buscar_dto.asesorId, 10) });
    }

    if (buscar_dto.termino) {
      const termino = `%${buscar_dto.termino.toLowerCase()}%`;
      query.andWhere(new Brackets(qb => {
        qb.where('LOWER(proyecto.titulo) LIKE :termino', { termino })
          .orWhere('LOWER(proyecto.resumen) LIKE :termino', { termino })
          .orWhere(`EXISTS (
            SELECT 1 FROM unnest(COALESCE(proyecto.palabras_clave, ARRAY[]::text[])) AS palabra 
            WHERE LOWER(palabra) LIKE :termino
          )`, { termino });
      }));
    }

    query.orderBy('proyecto.etapa_actual', 'DESC')
        .addOrderBy('proyecto.fecha_creacion', 'DESC');

    const proyectos = await query.getMany();

    return proyectos.map(proyecto => ({
      id: proyecto.id,
      titulo: proyecto.titulo,
      resumen: proyecto.resumen,
      palabras_clave: proyecto.palabras_clave || [],
      autor: proyecto.estudiantes?.[0]?.nombre 
      ? `${proyecto.estudiantes[0].nombre} ${proyecto.estudiantes[0].apellido}`
      : 'Autor desconocido',
      asesor: proyecto.asesor 
      ? `${proyecto.asesor.nombre} ${proyecto.asesor.apellido}`
      : 'Asesor desconocido',
      fecha_creacion: proyecto.fecha_creacion,
      etapa_actual: proyecto.etapa_actual,
      proyecto_aprobado: proyecto.proyecto_aprobado
    }));
  }

  async obtenerSolicitudesDefensa(estado?: string): Promise<Proyecto[]> {
    let etapas: EtapaProyecto[];

    switch (estado) {
      case 'aprobadas':
        etapas = [EtapaProyecto.TERMINADO];
        break;
      case 'rechazadas':
        etapas = [EtapaProyecto.LISTO_DEFENSA];
        break;
      case 'pendientes':
      default:
        etapas = [EtapaProyecto.SOLICITUD_DEFENSA];
    }
    
    const where_condicion: any = {
      etapa_actual: In(etapas)
    };
    
    if (estado === 'rechazadas') {
      where_condicion.comentarios_defensa = In(['IS NOT NULL', '!= \'\'']);
    }

    return this.repositorio_proyecto.find({
      where: where_condicion,
      relations: ['estudiantes', 'asesor', 'asesor.usuario'],
      order: { fecha_creacion: 'ASC' },
    });
  }

  async solicitarDefensa(id_proyecto: number, dto: SolicitarDefensaDto, id_usuario_estudiante: number) {
    const proyecto = await this.repositorio_proyecto.findOne({
      where: { id: id_proyecto },
      relations: ['estudiantes', 'estudiantes.usuario']
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id_proyecto} no encontrado`);
    }

    const esEstudianteDelProyecto = proyecto.estudiantes.some(e => e.usuario.id === id_usuario_estudiante);
    if (!esEstudianteDelProyecto) {
      throw new ForbiddenException('No tienes permiso para solicitar la defensa de este proyecto.');
    }

    if (proyecto.etapa_actual !== EtapaProyecto.LISTO_DEFENSA) {
      throw new BadRequestException('El proyecto no está marcado como "Listo para Defender" por tu asesor.');
    }

    proyecto.etapa_actual = EtapaProyecto.SOLICITUD_DEFENSA;
    proyecto.ruta_memorial = dto.ruta_memorial;
    
    await this.repositorio_proyecto.save(proyecto);
    
    return { message: 'Solicitud de defensa enviada exitosamente.' };
  }
  
  async responderSolicitudDefensa(id_proyecto: number, dto: ResponderSolicitudDefensaDto, id_usuario_admin: number) {
    const admin = await this.repositorio_usuario.findOneBy({ id: id_usuario_admin, rol: Rol.Administrador });
    if (!admin) {
      throw new ForbiddenException('Acción permitida solo para administradores.');
    }

    const proyecto = await this.repositorio_proyecto.findOne({
      where: { id: id_proyecto },
      relations: ['estudiantes'],
    });
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id_proyecto} no encontrado`);
    }

    if (proyecto.etapa_actual !== EtapaProyecto.SOLICITUD_DEFENSA) {
      throw new BadRequestException('Este proyecto no tiene una solicitud de defensa activa.');
    }

    if (dto.aprobada) {
      if (!dto.tribunales || dto.tribunales.length < 3 || dto.tribunales.length > 5) {
        throw new BadRequestException('Se deben asignar entre 3 y 5 tribunales para aprobar la defensa.');
      }
      proyecto.tribunales = dto.tribunales;
      proyecto.comentarios_defensa = dto.comentarios || 'Solicitud de defensa aprobada.';
      proyecto.etapa_actual = EtapaProyecto.TERMINADO;
      
      await this.repositorio_proyecto.save(proyecto);

      if (proyecto.estudiantes && proyecto.estudiantes.length > 0) {
        for (const estudiante of proyecto.estudiantes) {
          await this.servicio_grupos.desinscribirEstudianteDeGrupoActivo(estudiante.id);
        }
      }

      return { message: 'Defensa aprobada y proyecto marcado como terminado.' };

    } else {
      proyecto.etapa_actual = EtapaProyecto.LISTO_DEFENSA;
      proyecto.comentarios_defensa = dto.comentarios || 'Solicitud de defensa rechazada. Contacte al estudiante.';
      
      await this.repositorio_proyecto.save(proyecto);
      return { message: 'Solicitud de defensa rechazada. Se ha notificado al estudiante.' };
    }
  }

  async obtenerTimelineCompleto(id_usuario_estudiante: number): Promise<TimelineCompletoDto> {
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario_estudiante } },
      relations: ['proyecto']
    });

    if (!estudiante || !estudiante.proyecto) {
      throw new NotFoundException('No tienes un proyecto asignado');
    }

    const id_proyecto = estudiante.proyecto.id;

    const [proyecto, reuniones, documentos, observaciones] = await Promise.all([
      this.repositorio_proyecto.findOneBy({ id: id_proyecto }),
      this.repositorio_reunion.find({ where: { proyecto: { id: id_proyecto } }, order: { fecha_programada: 'ASC' } }),
      this.repositorio_documento.find({ where: { proyecto: { id: id_proyecto } }, order: { version: 'ASC' } }),
      this.repositorio_observacion.find({ 
        where: [
          { documento: { proyecto: { id: id_proyecto } } },
          { proyecto: { id: id_proyecto } }
        ], 
        relations: ['correcciones', 'documento'], 
        order: { fecha_creacion: 'ASC' } 
      })
    ]);

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const linea_tiempo: any[] = [];

    linea_tiempo.push({
      tipo: 'propuesta',
      fecha: proyecto.fecha_creacion,
      titulo: `Propuesta de Tema: ${proyecto.titulo}`,
      descripcion: `Estado: ${proyecto.propuesta_aprobada ? 'Aprobada' : 'Pendiente'}. ${proyecto.comentario_aprobacion_propuesta || ''}`,
      icono: 'file-text'
    });

    const versiones_perfil: any[] = [];
    const observaciones_perfil: any[] = [];
    const versiones_proyecto: any[] = [];
    const observaciones_proyecto: any[] = [];

    for (const doc of documentos) {
      const obs_doc = observaciones.filter(o => o.documento && o.documento.id === doc.id);
      
      const version_item = {
        id: doc.id,
        nombre_archivo: doc.nombre_archivo,
        version: doc.version,
        fecha_subida: doc.fecha_subida,
        observaciones_count: obs_doc.length,
      };
      
      linea_tiempo.push({
        tipo: 'version_documento',
        fecha: doc.fecha_subida,
        titulo: `Versión ${doc.version} subida`,
        descripcion: doc.nombre_archivo,
        icono: 'file-up'
      });

      const obs_timeline = obs_doc.map(o => {
        const correcciones_timeline = o.correcciones.map(c => {
          linea_tiempo.push({
            tipo: 'correccion',
            fecha: c.fecha_creacion,
            titulo: `Corrección para Obs. #${o.id}`,
            descripcion: `Estado: ${c.estado}. ${c.comentario_verificacion_html || ''}`,
            icono: 'tool'
          });
          return {
            id: c.id,
            estado: c.estado,
            fecha_creacion: c.fecha_creacion,
            fecha_verificacion: c.fecha_verificacion,
            comentario_verificacion: c.comentario_verificacion_html,
          };
        });
        
        linea_tiempo.push({
          tipo: 'observacion',
          fecha: o.fecha_creacion,
          titulo: `Observación (v${doc.version}): ${o.titulo}`,
          descripcion: `Estado: ${o.estado}. ${o.comentarios_asesor_html || ''}`,
          icono: 'search'
        });

        return {
          id: o.id,
          titulo: o.titulo,
          estado: o.estado,
          fecha_creacion: o.fecha_creacion,
          fecha_verificacion: o.fecha_verificacion,
          documento: doc.nombre_archivo,
          version_observada: o.version_observada,
          tiene_correccion: o.correcciones.length > 0,
          correcciones: correcciones_timeline,
        };
      });

      if (obs_doc.some(o => o.etapa_observada === EtapaProyecto.PERFIL || o.etapa_observada === EtapaProyecto.PROPUESTA)) {
        versiones_perfil.push(version_item);
        observaciones_perfil.push(...obs_timeline);
      } else {
        versiones_proyecto.push(version_item);
        observaciones_proyecto.push(...obs_timeline);
      }
    }
    
    const obs_proyecto_t2 = observaciones
      .filter(o => !o.documento && o.etapa_observada === EtapaProyecto.PROYECTO)
      .map(o => {
         linea_tiempo.push({
          tipo: 'observacion',
          fecha: o.fecha_creacion,
          titulo: `Observación (Proyecto): ${o.titulo}`,
          descripcion: `Estado: ${o.estado}. ${o.comentarios_asesor_html || ''}`,
          icono: 'search'
        });
        return {
          id: o.id,
          titulo: o.titulo,
          estado: o.estado,
          fecha_creacion: o.fecha_creacion,
          fecha_verificacion: o.fecha_verificacion,
          documento: 'Observación de Proyecto',
          version_observada: undefined,
          tiene_correccion: false,
          correcciones: [],
        };
      });
    
    observaciones_proyecto.push(...obs_proyecto_t2);

    const reuniones_timeline = reuniones.map(r => {
      linea_tiempo.push({
        tipo: 'reunion',
        fecha: r.fecha_programada,
        titulo: `Reunión: ${r.titulo}`,
        descripcion: `Estado: ${r.estado}. ${r.notas_reunion_html || ''}`,
        icono: 'users'
      });
      return {
        id: r.id,
        titulo: r.titulo,
        fecha_programada: r.fecha_programada,
        fecha_realizada: r.fecha_realizada,
        estado: r.estado,
        notas_reunion_html: r.notas_reunion_html,
      };
    });
    
    if (proyecto.fecha_aprobacion_propuesta) {
      linea_tiempo.push({ tipo: 'perfil_inicio', fecha: proyecto.fecha_aprobacion_propuesta, titulo: 'Propuesta Aprobada', descripcion: 'Inicio de etapa de Perfil.', icono: 'check-circle' });
    }
    if (proyecto.fecha_aprobacion_perfil) {
      linea_tiempo.push({ tipo: 'perfil_aprobado', fecha: proyecto.fecha_aprobacion_perfil, titulo: 'Perfil Aprobado', descripcion: 'Inicio de etapa de Proyecto.', icono: 'check-circle' });
    }
    if (proyecto.fecha_aprobacion_proyecto) {
      linea_tiempo.push({ tipo: 'proyecto_listo', fecha: proyecto.fecha_aprobacion_proyecto, titulo: 'Proyecto Listo para Defensa', descripcion: 'Asesor aprobó el proyecto.', icono: 'check-circle' });
    }
    if (proyecto.etapa_actual === EtapaProyecto.SOLICITUD_DEFENSA) {
      linea_tiempo.push({ tipo: 'defensa_solicitada', fecha: new Date(), titulo: 'Defensa Solicitada', descripcion: 'Esperando respuesta de administración.', icono: 'send' });
    }
    if (proyecto.etapa_actual === EtapaProyecto.TERMINADO) {
      linea_tiempo.push({ tipo: 'defensa_aprobada', fecha: new Date(), titulo: 'Defensa Aprobada', descripcion: 'Proyecto Terminado.', icono: 'award' });
    }
    
    linea_tiempo.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    return {
      proyecto: {
        id: proyecto.id,
        titulo: proyecto.titulo,
        etapa_actual: proyecto.etapa_actual,
        fecha_creacion: proyecto.fecha_creacion,
      },
      perfil: {
        aprobado: proyecto.perfil_aprobado,
        fecha_aprobacion: proyecto.fecha_aprobacion_perfil,
        comentarios: proyecto.comentario_aprobacion_perfil,
        versiones: versiones_perfil,
        observaciones: observaciones_perfil,
      },
      proyecto_desarrollo: {
        aprobado: proyecto.proyecto_aprobado,
        fecha_aprobacion: proyecto.fecha_aprobacion_proyecto,
        comentarios: proyecto.comentario_aprobacion_proyecto,
        reuniones: reuniones_timeline,
        versiones: versiones_proyecto,
        observaciones: observaciones_proyecto,
      },
      defensa: {
        solicitada: proyecto.etapa_actual === EtapaProyecto.SOLICITUD_DEFENSA || proyecto.etapa_actual === EtapaProyecto.TERMINADO,
        aprobada: proyecto.etapa_actual === EtapaProyecto.TERMINADO,
        tribunales: proyecto.tribunales,
        comentarios: proyecto.comentarios_defensa,
      },
      linea_tiempo: linea_tiempo,
    };
  }
}