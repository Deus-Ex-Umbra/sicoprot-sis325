import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from './entidades/grupo.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Periodo } from '../periodos/entidades/periodo.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { CrearGrupoDto } from './dto/crear-grupo.dto';
import { ActualizarGrupoDto } from './dto/actualizar-grupo.dto';
import { TipoGrupo } from './enums/tipo-grupo.enum';
import { EtapaProyecto } from '../proyectos/enums/etapa-proyecto.enum';

@Injectable()
export class GruposService {
  constructor(
    @InjectRepository(Grupo)
    private readonly repositorio_grupo: Repository<Grupo>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
    @InjectRepository(Periodo)
    private readonly repositorio_periodo: Repository<Periodo>,
    @InjectRepository(Estudiante)
    private readonly repositorio_estudiante: Repository<Estudiante>,
  ) {}

  async crear(crear_grupo_dto: CrearGrupoDto) {
    const asesor = await this.repositorio_asesor.findOneBy({ id: crear_grupo_dto.id_asesor });
    if (!asesor) {
      throw new NotFoundException(`Asesor con ID '${crear_grupo_dto.id_asesor}' no encontrado.`);
    }

    const periodo = await this.repositorio_periodo.findOneBy({ id: crear_grupo_dto.id_periodo });
    if (!periodo) {
      throw new NotFoundException(`Período con ID '${crear_grupo_dto.id_periodo}' no encontrado.`);
    }

    const nuevo_grupo = this.repositorio_grupo.create({
      ...crear_grupo_dto,
      asesor,
      periodo,
    });

    return this.repositorio_grupo.save(nuevo_grupo);
  }

  async obtenerTodos() {
    return this.repositorio_grupo.find({
      relations: ['asesor', 'asesor.usuario', 'periodo', 'estudiantes', 'estudiantes.usuario'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async obtenerGruposDisponibles(id_usuario: number) {
    const periodo_activo = await this.repositorio_periodo.findOne({
      where: { activo: true }
    });

    if (!periodo_activo) {
      return [];
    }
    
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
      relations: ['proyecto']
    });

    if (!estudiante) {
      throw new ForbiddenException('Solo los estudiantes pueden ver grupos disponibles.');
    }

    const perfil_aprobado = estudiante.proyecto?.perfil_aprobado || false;
    
    const tipo_requerido = perfil_aprobado 
      ? TipoGrupo.TALLER_GRADO_II 
      : TipoGrupo.TALLER_GRADO_I;
    
    const where_query: any = {
      periodo: { id: periodo_activo.id },
      activo: true,
      tipo: tipo_requerido
    };

    const grupos = await this.repositorio_grupo.find({
      where: where_query,
      relations: ['asesor', 'asesor.usuario', 'periodo', 'estudiantes', 'estudiantes.usuario'],
    });

    return grupos.map(grupo => ({
      ...grupo,
      numero_estudiantes: grupo.estudiantes?.length || 0
    }));
  }

  async obtenerGrupoDelEstudiante(id_usuario: number) {
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
      relations: ['grupos', 'grupos.asesor', 'grupos.asesor.usuario', 'grupos.periodo', 'estudiantes', 'estudiantes.usuario'],
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado.');
    }

    if (!estudiante.grupos || estudiante.grupos.length === 0) {
      return null;
    }

    const grupo_activo = estudiante.grupos.find(g => g.periodo && g.periodo.activo);
    return grupo_activo || null;
  }

  async obtenerPorPeriodo(id_periodo: number) {
    return this.repositorio_grupo.find({
      where: { periodo: { id: id_periodo } },
      relations: ['asesor', 'asesor.usuario', 'periodo', 'estudiantes', 'estudiantes.usuario'],
    });
  }

  async obtenerUno(id: number) {
    const grupo = await this.repositorio_grupo.findOne({
      where: { id },
      relations: ['asesor', 'asesor.usuario', 'periodo', 'estudiantes', 'estudiantes.usuario'],
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID '${id}' no encontrado.`);
    }

    return grupo;
  }

  async actualizar(id: number, actualizar_grupo_dto: ActualizarGrupoDto) {
    const grupo = await this.repositorio_grupo.findOneBy({ id });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID '${id}' no encontrado.`);
    }

    if (actualizar_grupo_dto.id_asesor) {
      const asesor = await this.repositorio_asesor.findOneBy({ id: actualizar_grupo_dto.id_asesor });
      if (!asesor) {
        throw new NotFoundException(`Asesor con ID '${actualizar_grupo_dto.id_asesor}' no encontrado.`);
      }
      grupo.asesor = asesor;
    }

    if (actualizar_grupo_dto.id_periodo) {
      const periodo = await this.repositorio_periodo.findOneBy({ id: actualizar_grupo_dto.id_periodo });
      if (!periodo) {
        throw new NotFoundException(`Período con ID '${actualizar_grupo_dto.id_periodo}' no encontrado.`);
      }
      grupo.periodo = periodo;
    }

    const { nombre, descripcion, activo, tipo, carrera, ...fechas_limite } = actualizar_grupo_dto;
    
    if (nombre !== undefined) grupo.nombre = nombre;
    if (descripcion !== undefined) grupo.descripcion = descripcion;
    if (activo !== undefined) grupo.activo = activo;
    if (tipo !== undefined) grupo.tipo = tipo;
    if (carrera !== undefined) grupo.carrera = carrera;

    Object.assign(grupo, fechas_limite);

    return this.repositorio_grupo.save(grupo);
  }

  async asignarEstudiante(id_grupo: number, id_estudiante: number) {
    const grupo = await this.repositorio_grupo.findOne({
      where: { id: id_grupo },
      relations: ['estudiantes', 'periodo', 'asesor'],
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID '${id_grupo}' no encontrado.`);
    }

    if (!grupo.activo) {
      throw new BadRequestException('No se puede asignar estudiantes a un grupo inactivo.');
    }

    const estudiante = await this.repositorio_estudiante.findOne({
      where: { id: id_estudiante },
      relations: ['grupos', 'grupos.periodo', 'proyecto'],
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID '${id_estudiante}' no encontrado.`);
    }

    const grupo_activo_existente = estudiante.grupos.find(g => g.periodo && g.periodo.activo);
    if (grupo_activo_existente && grupo_activo_existente.id !== id_grupo) {
      throw new BadRequestException('El estudiante ya pertenece a otro grupo activo. Debes removerlo primero.');
    }

    const perfil_aprobado = estudiante.proyecto?.perfil_aprobado || false;
    if (grupo.tipo === TipoGrupo.TALLER_GRADO_II && !perfil_aprobado) {
      throw new BadRequestException('El estudiante debe tener un perfil aprobado para Taller II.');
    }
    if (grupo.tipo === TipoGrupo.TALLER_GRADO_I && perfil_aprobado) {
      throw new BadRequestException('El estudiante ya tiene perfil aprobado, no puede unirse a Taller I.');
    }

    if (!estudiante.grupos.find(g => g.id === id_grupo)) {
      estudiante.grupos.push(grupo);
      
      if (grupo.tipo === TipoGrupo.TALLER_GRADO_II && estudiante.proyecto) {
        estudiante.proyecto.asesor = grupo.asesor;
        estudiante.proyecto.etapa_actual = EtapaProyecto.PROYECTO;
      }
      
      await this.repositorio_estudiante.save(estudiante);
    }

    return this.obtenerUno(id_grupo);
  }

  async inscribirEstudiante(id_grupo: number, id_usuario: number) {
    const grupo = await this.repositorio_grupo.findOne({
      where: { id: id_grupo },
      relations: ['estudiantes', 'periodo', 'asesor'],
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID '${id_grupo}' no encontrado.`);
    }

    if (!grupo.activo) {
      throw new BadRequestException('Este grupo no está activo.');
    }

    if (!grupo.periodo.activo) {
      throw new BadRequestException('El período de inscripciones no está activo.');
    }

    const ahora = new Date();
    ahora.setHours(0, 0, 0, 0);

    const fecha_inicio = new Date(grupo.periodo.fecha_inicio_inscripciones);
    fecha_inicio.setHours(0, 0, 0, 0);
    
    const fecha_fin = new Date(grupo.periodo.fecha_fin_inscripciones);
    fecha_fin.setHours(23, 59, 59, 999);

    if (ahora < fecha_inicio) {
      const fecha_inicio_formato = fecha_inicio.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      throw new BadRequestException(
        `El período de inscripciones aún no ha comenzado. Inicia el ${fecha_inicio_formato}.`
      );
    }

    if (ahora > fecha_fin) {
      const fecha_fin_formato = fecha_fin.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      throw new BadRequestException(
        `El período de inscripciones ya finalizó el ${fecha_fin_formato}.`
      );
    }

    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
      relations: ['grupos', 'grupos.periodo', 'proyecto'],
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado.');
    }

    const grupo_activo_existente = estudiante.grupos.find(g => g.periodo && g.periodo.activo);
    if (grupo_activo_existente) {
      throw new BadRequestException('Ya estás inscrito en un grupo activo. Debes desinscribirte primero.');
    }

    if (grupo.tipo === TipoGrupo.TALLER_GRADO_II && (!estudiante.proyecto || !estudiante.proyecto.perfil_aprobado)) {
      throw new BadRequestException('Debes tener un perfil de proyecto aprobado para inscribirte a Taller de Grado II.');
    }

    if (grupo.tipo === TipoGrupo.TALLER_GRADO_I && estudiante.proyecto && estudiante.proyecto.perfil_aprobado) {
        throw new BadRequestException('Ya tienes un perfil aprobado, no puedes inscribirte a Taller de Grado I.');
    }

    estudiante.grupos.push(grupo);
    
    if (grupo.tipo === TipoGrupo.TALLER_GRADO_II && estudiante.proyecto) {
        estudiante.proyecto.asesor = grupo.asesor;
        estudiante.proyecto.etapa_actual = EtapaProyecto.PROYECTO;
    }

    await this.repositorio_estudiante.save(estudiante);

    return {
      message: 'Te has inscrito exitosamente al grupo.',
      grupo: await this.obtenerUno(id_grupo)
    };
  }

  async desinscribirEstudianteDeGrupoActivo(id_estudiante: number) {
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { id: id_estudiante },
      relations: ['grupos', 'grupos.periodo'],
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado.');
    }
    
    const grupo_activo = estudiante.grupos.find(g => g.periodo && g.periodo.activo);
    
    if (grupo_activo) {
      estudiante.grupos = estudiante.grupos.filter(g => g.id !== grupo_activo.id);
      await this.repositorio_estudiante.save(estudiante);
      return true;
    }
    return false;
  }

  async desinscribirEstudiante(id_grupo: number, id_usuario: number) {
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
      relations: ['grupos', 'grupos.periodo'],
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado.');
    }

    const grupo_a_eliminar = estudiante.grupos.find(g => g.id === id_grupo);

    if (!grupo_a_eliminar) {
      throw new BadRequestException('No estás inscrito en este grupo.');
    }
    
    if (!grupo_a_eliminar.periodo) {
      throw new BadRequestException('El grupo no tiene un período asociado.');
    }

    const ahora = new Date();
    ahora.setHours(0, 0, 0, 0);

    const fecha_inicio = new Date(grupo_a_eliminar.periodo.fecha_inicio_inscripciones);
    fecha_inicio.setHours(0, 0, 0, 0);
    
    const fecha_fin = new Date(grupo_a_eliminar.periodo.fecha_fin_inscripciones);
    fecha_fin.setHours(23, 59, 59, 999);

    if (ahora < fecha_inicio || ahora > fecha_fin) {
      throw new BadRequestException('No estás dentro del período de inscripciones para desinscribirte.');
    }

    estudiante.grupos = estudiante.grupos.filter(g => g.id !== id_grupo);
    await this.repositorio_estudiante.save(estudiante);

    return {
      message: 'Te has desinscrito exitosamente del grupo.'
    };
  }

  async removerEstudiante(id_grupo: number, id_estudiante: number) {
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { id: id_estudiante },
      relations: ['grupos'],
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID '${id_estudiante}' no encontrado.`);
    }

    const grupo_encontrado = estudiante.grupos.some(g => g.id === id_grupo);
    if (!grupo_encontrado) {
      throw new BadRequestException('El estudiante no pertenece a este grupo.');
    }

    estudiante.grupos = estudiante.grupos.filter(g => g.id !== id_grupo);
    await this.repositorio_estudiante.save(estudiante);

    return this.obtenerUno(id_grupo);
  }

  async eliminar(id: number) {
    const grupo = await this.repositorio_grupo.findOne({
      where: { id },
      relations: ['estudiantes'],
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID '${id}' no encontrado.`);
    }

    if (grupo.estudiantes && grupo.estudiantes.length > 0) {
      throw new BadRequestException('No se puede eliminar un grupo que tiene estudiantes asignados.');
    }

    await this.repositorio_grupo.remove(grupo);
    return { message: `Grupo con ID '${id}' eliminado exitosamente.` };
  }
}