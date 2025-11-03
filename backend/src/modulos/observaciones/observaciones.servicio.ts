import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observacion } from './entidades/observacion.entidad';
import { Repository, In } from 'typeorm';
import { CrearObservacionDto } from './dto/crear-observacion.dto';
import { Documento } from '../documentos/entidades/documento.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { ActualizarObservacionDto } from './dto/actualizar-observacion.dto';
import { VerificarObservacionDto } from './dto/verificar-observacion.dto';
import { EstadoObservacion } from './enums/estado-observacion.enum';
import { EtapaProyecto } from '../proyectos/enums/etapa-proyecto.enum';

@Injectable()
export class ObservacionesService {
  constructor(
    @InjectRepository(Observacion)
    private readonly repositorio_observacion: Repository<Observacion>,
    @InjectRepository(Documento)
    private readonly repositorio_documento: Repository<Documento>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
    @InjectRepository(Estudiante)
    private readonly repositorio_estudiante: Repository<Estudiante>,
  ) {}

  async crear(
    id_documento: number,
    crear_observacion_dto: CrearObservacionDto,
    id_usuario: number,
  ) {
    const documento = await this.repositorio_documento.findOne({
      where: { id: id_documento },
      relations: ['proyecto'],
    });
    if (!documento) {
      throw new NotFoundException(
        `Documento con ID '${id_documento}' no encontrado.`,
      );
    }

    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor) {
      throw new ForbiddenException(
        'Solo los asesores pueden crear observaciones.',
      );
    }

    const nueva_observacion = this.repositorio_observacion.create({
      ...crear_observacion_dto,
      contenido_html: crear_observacion_dto.contenido_html,
      descripcion_corta:
        crear_observacion_dto.descripcion_corta ||
        crear_observacion_dto.titulo,
      documento,
      autor: asesor,
      version_observada: documento.version,
      etapa_observada: documento.proyecto.etapa_actual,
      estado: EstadoObservacion.PENDIENTE,
    });

    return this.repositorio_observacion.save(nueva_observacion);
  }

  async obtenerPorDocumento(
    id_documento: number,
    incluir_archivadas: boolean = false,
  ) {
    const condiciones: any = { documento: { id: id_documento } };

    if (!incluir_archivadas) {
      condiciones.archivada = false;
    }

    return this.repositorio_observacion.find({
      where: condiciones,
      relations: ['correcciones', 'correcciones.estudiante'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async actualizar(
    id: number,
    actualizar_observacion_dto: ActualizarObservacionDto,
    id_usuario: number,
  ) {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id },
      relations: ['autor'],
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID '${id}' no encontrada.`);
    }

    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor || asesor.id !== observacion.autor.id) {
      throw new ForbiddenException(
        'Solo el asesor que creó la observación puede actualizarla.',
      );
    }
    
    if (actualizar_observacion_dto.contenido_html) {
        observacion.contenido_html = actualizar_observacion_dto.contenido_html;
    }

    Object.assign(observacion, actualizar_observacion_dto);
    return this.repositorio_observacion.save(observacion);
  }

  async archivar(id: number, id_usuario: number) {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id },
      relations: ['autor'],
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID '${id}' no encontrada.`);
    }

    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor || asesor.id !== observacion.autor.id) {
      throw new ForbiddenException(
        'Solo el asesor que creó la observación puede archivarla.',
      );
    }

    observacion.archivada = true;
    return this.repositorio_observacion.save(observacion);
  }

  async restaurar(id: number, id_usuario: number) {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id, archivada: true },
      relations: ['autor'],
    });

    if (!observacion) {
      throw new NotFoundException(
        `Observación archivada con ID '${id}' no encontrada.`,
      );
    }

    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor || asesor.id !== observacion.autor.id) {
      throw new ForbiddenException(
        'Solo el asesor que archivó la observación puede restaurarla.',
      );
    }

    observacion.archivada = false;
    return this.repositorio_observacion.save(observacion);
  }

  async cambiarEstado(
    id: number,
    id_usuario: number,
    cambiarEstadoDto: ActualizarObservacionDto,
  ): Promise<Observacion> {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id },
      relations: [
        'autor',
        'documento',
        'documento.proyecto',
        'documento.proyecto.estudiantes',
      ],
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID '${id}' no encontrada.`);
    }

    if (!cambiarEstadoDto.estado) {
      throw new BadRequestException(
        'El nuevo estado de la observación es obligatorio.',
      );
    }

    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor || asesor.id !== observacion.autor.id) {
      throw new ForbiddenException(
        'No tienes permisos para modificar esta observación.',
      );
    }

    this.validarTransicionEstado(observacion.estado, cambiarEstadoDto.estado);

    observacion.estado = cambiarEstadoDto.estado;
    if (cambiarEstadoDto.comentarios_asesor_html) {
      observacion.comentarios_asesor_html =
        cambiarEstadoDto.comentarios_asesor_html;
    }

    const observacionActualizada =
      await this.repositorio_observacion.save(observacion);

    return observacionActualizada;
  }

  async listarPendientes(id_usuario: number): Promise<Observacion[]> {
    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor) {
      throw new ForbiddenException(
        'Solo los asesores pueden listar observaciones pendientes.',
      );
    }

    return this.repositorio_observacion.find({
      where: {
        estado: EstadoObservacion.PENDIENTE,
        autor: { id: asesor.id },
      },
      relations: ['documento', 'autor'],
      order: { fecha_creacion: 'ASC' },
    });
  }

  async verificarObservacion(
    id: number,
    dto: VerificarObservacionDto,
    id_usuario: number,
  ): Promise<Observacion> {
    const obs = await this.repositorio_observacion.findOne({
      where: { id },
      relations: ['autor', 'documento', 'correcciones'],
    });

    if (!obs) {
      throw new NotFoundException(`No se encontró la observación con id ${id}`);
    }

    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor || asesor.id !== obs.autor.id) {
      throw new ForbiddenException(
        'Solo el asesor que creó la observación puede verificarla.',
      );
    }

    obs.estado = dto.nuevoEstado;
    if (dto.verificacion_asesor_html) {
      obs.comentario_verificacion_html = dto.verificacion_asesor_html;
    }
    obs.fecha_verificacion = new Date();

    return await this.repositorio_observacion.save(obs);
  }

  async obtenerObservacionesDelAsesor(
    id_usuario: number,
  ): Promise<Observacion[]> {
    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor) {
      throw new ForbiddenException(
        'Solo los asesores pueden acceder a sus observaciones.',
      );
    }

    return this.repositorio_observacion.find({
      where: { autor: { id: asesor.id } },
      relations: [
        'autor',
        'autor.usuario',
        'documento',
        'documento.proyecto',
        'documento.proyecto.estudiantes',
        'documento.proyecto.estudiantes.usuario',
        'documento.proyecto.asesor',
      ],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async obtenerObservacionesPorProyecto(proyectoId: number, id_usuario: number) {
    return await this.repositorio_observacion
      .createQueryBuilder('observacion')
      .innerJoinAndSelect('observacion.documento', 'documento')
      .innerJoinAndSelect('observacion.autor', 'autor')
      .leftJoinAndSelect('observacion.correcciones', 'correccion')
      .where('documento.proyecto.id = :proyectoId', { proyectoId })
      .orderBy('observacion.fecha_creacion', 'DESC')
      .getMany();
  }

  async obtenerEstadisticasPorDocumento(
    documentoId: number,
    id_usuario: number,
  ) {
    const observaciones = await this.repositorio_observacion.find({
      where: { documento: { id: documentoId } },
    });

    const estadisticas = {
      total: observaciones.length,
      pendiente: observaciones.filter(
        (o) => o.estado === EstadoObservacion.PENDIENTE,
      ).length,
      en_revision: observaciones.filter(
        (o) => o.estado === EstadoObservacion.EN_REVISION,
      ).length,
      corregida: observaciones.filter(
        (o) => o.estado === EstadoObservacion.CORREGIDA,
      ).length,
      rechazado: observaciones.filter(
        (o) => o.estado === EstadoObservacion.RECHAZADO,
      ).length,
    };

    return {
      documentoId,
      estadisticas,
      porcentaje_completado:
        estadisticas.total > 0
          ? Math.round((estadisticas.corregida / estadisticas.total) * 100)
          : 0,
    };
  }

  async obtenerObservacionesPorRevisor(revisorId: number, id_usuario: number) {
    const asesor = await this.repositorio_asesor.findOne({
      where: { id: revisorId },
    });

    if (!asesor) {
      throw new NotFoundException(`Asesor con ID ${revisorId} no encontrado`);
    }

    return await this.repositorio_observacion.find({
      where: { autor: { id: revisorId } },
      relations: ['documento', 'documento.proyecto'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async obtenerObservacionPorId(id: number, id_usuario: number) {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id },
      relations: ['autor', 'documento', 'documento.proyecto', 'correcciones'],
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID ${id} no encontrada`);
    }

    return observacion;
  }

  async eliminarObservacion(id: number, id_usuario: number) {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id },
      relations: ['autor'],
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID ${id}' no encontrada`);
    }

    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor || asesor.id !== observacion.autor.id) {
      throw new ForbiddenException(
        'Solo el autor de la observación puede eliminarla',
      );
    }

    await this.repositorio_observacion.remove(observacion);
  }

  async obtenerPorEstudiante(id_usuario: number) {
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
      relations: ['proyecto'],
    });

    if (!estudiante) {
      throw new ForbiddenException(
        'Solo los estudiantes pueden acceder a sus observaciones.',
      );
    }

    if (!estudiante.proyecto) {
      return [];
    }

    return this.repositorio_observacion.find({
      where: {
        documento: {
          proyecto: { id: estudiante.proyecto.id },
        },
        archivada: false,
      },
      relations: [
        'autor',
        'autor.usuario',
        'documento',
        'documento.proyecto',
        'documento.proyecto.estudiantes',
        'documento.proyecto.estudiantes.usuario',
        'documento.proyecto.asesor',
        'correcciones',
      ],
      order: { fecha_creacion: 'DESC' },
    });
  }

  private validarTransicionEstado(
    estadoActual: EstadoObservacion,
    nuevoEstado: EstadoObservacion,
  ): void {
    const transicionesValidas: {
      [key in EstadoObservacion]?: EstadoObservacion[];
    } = {
      [EstadoObservacion.PENDIENTE]: [
        EstadoObservacion.EN_REVISION,
      ],
      [EstadoObservacion.EN_REVISION]: [
        EstadoObservacion.CORREGIDA,
        EstadoObservacion.RECHAZADO,
      ],
      [EstadoObservacion.RECHAZADO]: [
          EstadoObservacion.EN_REVISION
      ],
    };

    const transicionesPermitidas = transicionesValidas[estadoActual] || [];

    if (!transicionesPermitidas.includes(nuevoEstado)) {
      throw new BadRequestException(
        `Transición inválida de ${estadoActual} a ${nuevoEstado}`,
      );
    }
  }

  async contarObservacionesPendientes(
    id_proyecto: number,
    etapa: EtapaProyecto,
  ): Promise<number> {
    return this.repositorio_observacion.count({
      where: {
        documento: { proyecto: { id: id_proyecto } },
        etapa_observada: etapa,
        estado: In([EstadoObservacion.PENDIENTE, EstadoObservacion.RECHAZADO, EstadoObservacion.EN_REVISION]),
        archivada: false,
      },
    });
  }
}