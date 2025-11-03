import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Correccion } from './entidades/correccion.entidad';
import { Observacion } from '../observaciones/entidades/observacion.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Documento } from '../documentos/entidades/documento.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { CrearCorreccionDto } from './dto/crear-correccion.dto';
import { ActualizarCorreccionDto } from './dto/actualizar-correccion.dto';
import { MarcarCorregidoDto } from './dto/marcar-correccion.dto';
import { VerificarCorreccionDto } from './dto/verificar-correccion.dto';
import { EstadoObservacion } from '../observaciones/enums/estado-observacion.enum';
import { EstadoCorreccion } from './enums/estado-correccion.enum';

@Injectable()
export class CorreccionesService {
  constructor(
    @InjectRepository(Correccion)
    private readonly repositorio_correccion: Repository<Correccion>,
    @InjectRepository(Observacion)
    private readonly repositorio_observacion: Repository<Observacion>,
    @InjectRepository(Estudiante)
    private readonly repositorio_estudiante: Repository<Estudiante>,
    @InjectRepository(Documento)
    private readonly repositorio_documento: Repository<Documento>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
  ) {}

  async crear(crear_correccion_dto: CrearCorreccionDto, id_usuario: number) {
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!estudiante) {
      throw new ForbiddenException(
        'Solo los estudiantes pueden crear correcciones.',
      );
    }

    const nueva_correccion = this.repositorio_correccion.create({
      ...crear_correccion_dto,
      estudiante,
    });

    const correccion_guardada =
      await this.repositorio_correccion.save(nueva_correccion);

    return correccion_guardada;
  }

  async crearPorObservacion(
    observacionId: number,
    crear_correccion_dto: CrearCorreccionDto,
    id_usuario: number,
  ): Promise<Correccion> {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id: observacionId },
      relations: [
        'documento',
        'documento.proyecto',
        'documento.proyecto.estudiantes',
        'correccion',
      ],
    });

    if (!observacion) {
      throw new NotFoundException(
        `Observación con ID ${observacionId} no encontrada`,
      );
    }

    if (
      observacion.estado !== EstadoObservacion.PENDIENTE &&
      observacion.estado !== EstadoObservacion.RECHAZADO
    ) {
      throw new BadRequestException(
        `No se puede crear una corrección para una observación en estado ${observacion.estado}`,
      );
    }

    if (observacion.correccion) {
      throw new BadRequestException(
        'Esta observación ya tiene una corrección asociada. Use el endpoint de actualización.',
      );
    }

    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!estudiante) {
      throw new ForbiddenException(
        'Solo los estudiantes pueden crear correcciones',
      );
    }

    const esEstudiante = observacion.documento?.proyecto?.estudiantes?.some(
      (est) => est.id === estudiante.id,
    );

    if (!esEstudiante) {
      throw new ForbiddenException(
        'Solo los estudiantes del proyecto pueden crear correcciones para esta observación',
      );
    }

    const nuevaCorreccion = this.repositorio_correccion.create({
      ...crear_correccion_dto,
      observacion,
      estudiante,
      documento: observacion.documento,
      estado: EstadoCorreccion.PENDIENTE_REVISION,
    });

    const correccionGuardada =
      await this.repositorio_correccion.save(nuevaCorreccion);

    observacion.version_corregida = crear_correccion_dto.version_corregida;
    await this.repositorio_observacion.save(observacion);

    return correccionGuardada;
  }

  async marcarCompletada(
    observacionId: number,
    dto: MarcarCorregidoDto,
    id_usuario: number,
  ): Promise<Correccion> {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id: observacionId },
      relations: ['correccion', 'correccion.estudiante'],
    });

    if (!observacion) {
      throw new NotFoundException(
        `Observación con ID ${observacionId} no encontrada`,
      );
    }

    if (!observacion.correccion) {
      throw new NotFoundException(
        'Esta observación no tiene una corrección asociada. Cree una primero.',
      );
    }

    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!estudiante || estudiante.id !== observacion.correccion.estudiante.id) {
      throw new ForbiddenException(
        'Solo el estudiante que creó la corrección puede marcarla como completada',
      );
    }

    observacion.correccion.version_corregida = dto.version_corregida;
    if (dto.comentario_html) {
      observacion.correccion.descripcion_html = dto.comentario_html;
    }
    observacion.correccion.estado = EstadoCorreccion.PENDIENTE_REVISION;

    const correccionActualizada = await this.repositorio_correccion.save(
      observacion.correccion,
    );

    observacion.version_corregida = dto.version_corregida;
    await this.repositorio_observacion.save(observacion);

    return correccionActualizada;
  }

  async verificar(
    observacionId: number,
    dto: VerificarCorreccionDto,
    id_usuario: number,
  ): Promise<any> {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id: observacionId },
      relations: ['correccion', 'correccion.estudiante', 'autor'],
    });

    if (!observacion) {
      throw new NotFoundException(
        `Observación con ID ${observacionId} no encontrada`,
      );
    }

    if (!observacion.correccion) {
      throw new NotFoundException(
        'Esta observación no tiene una corrección para verificar',
      );
    }

    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor || asesor.id !== observacion.autor.id) {
      throw new ForbiddenException(
        'Solo el asesor que creó la observación puede verificar la corrección',
      );
    }

    const correccion_a_gestionar = observacion.correccion;

    observacion.estado = dto.resultado;
    observacion.fecha_verificacion = new Date();
    observacion.comentario_verificacion_html = dto.comentario_verificacion_html;

    if (dto.resultado === EstadoObservacion.CORREGIDA) {
      correccion_a_gestionar.estado = EstadoCorreccion.ACEPTADA;
      correccion_a_gestionar.estado_verificacion = 'APROBADA';
      correccion_a_gestionar.comentario_verificacion_html =
        dto.comentario_verificacion_html;
      correccion_a_gestionar.fecha_verificacion = new Date();
      await this.repositorio_correccion.save(correccion_a_gestionar);
    } else if (dto.resultado === EstadoObservacion.RECHAZADO) {
      correccion_a_gestionar.estado = EstadoCorreccion.RECHAZADA;
      correccion_a_gestionar.estado_verificacion = 'RECHAZADA';
      correccion_a_gestionar.comentario_verificacion_html =
        dto.comentario_verificacion_html;
      correccion_a_gestionar.fecha_verificacion = new Date();

      await this.repositorio_correccion.remove(correccion_a_gestionar);
      observacion.correccion = null;
    }

    await this.repositorio_observacion.save(observacion);

    return {
      message: `Corrección ${dto.resultado}`,
      observacion_actualizada: observacion,
    };
  }

  async obtenerPorDocumento(id_documento: number) {
    return this.repositorio_correccion.find({
      where: { documento: { id: id_documento } },
      relations: ['observacion', 'estudiante', 'documento'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async obtenerPorProyecto(id_proyecto: number) {
    return this.repositorio_correccion
      .createQueryBuilder('correccion')
      .innerJoinAndSelect('correccion.documento', 'documento')
      .innerJoinAndSelect('correccion.estudiante', 'estudiante')
      .leftJoinAndSelect('correccion.observacion', 'observacion')
      .innerJoin('documento.proyecto', 'proyecto')
      .where('proyecto.id = :id_proyecto', { id_proyecto })
      .orderBy('correccion.fecha_creacion', 'DESC')
      .getMany();
  }

  async obtenerPorEstudiante(id_usuario: number) {
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
      relations: ['usuario'],
    });

    if (!estudiante) {
      throw new ForbiddenException(
        'Solo los estudiantes pueden acceder a sus observaciones.',
      );
    }

    return await this.repositorio_observacion
      .createQueryBuilder('observacion')
      .innerJoin('observacion.documento', 'documento')
      .innerJoin('documento.proyecto', 'proyecto')
      .innerJoin('proyecto.estudiantes', 'est')
      .where('est.id = :estudianteId', { estudianteId: estudiante.id })
      .andWhere('observacion.archivada = false')
      .orderBy('observacion.fecha_creacion', 'DESC')
      .getMany();
  }

  async obtenerPorObservacion(
    observacionId: number,
    id_usuario: number,
  ): Promise<Correccion> {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id: observacionId },
      relations: ['correccion', 'correccion.estudiante'],
    });

    if (!observacion) {
      throw new NotFoundException(
        `Observación con ID ${observacionId} no encontrada`,
      );
    }

    if (!observacion.correccion) {
      throw new NotFoundException(
        'Esta observación no tiene una corrección asociada',
      );
    }

    return observacion.correccion;
  }

  async listarPorEstudiante(id_usuario: number): Promise<Correccion[]> {
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return await this.repositorio_correccion.find({
      where: { estudiante: { id: estudiante.id } },
      relations: ['observacion', 'observacion.documento'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async actualizar(
    id: number,
    actualizar_correccion_dto: ActualizarCorreccionDto,
    id_usuario: number,
  ) {
    const correccion = await this.repositorio_correccion.findOne({
      where: { id },
      relations: ['estudiante'],
    });

    if (!correccion) {
      throw new NotFoundException(`Corrección con ID '${id}' no encontrada.`);
    }

    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!estudiante || estudiante.id !== correccion.estudiante.id) {
      throw new ForbiddenException(
        'Solo el estudiante que creó la corrección puede actualizarla.',
      );
    }

    Object.assign(correccion, actualizar_correccion_dto);
    return this.repositorio_correccion.save(correccion);
  }

  async eliminar(id: number, id_usuario: number) {
    const correccion = await this.repositorio_correccion.findOne({
      where: { id },
      relations: ['estudiante', 'observacion'],
    });

    if (!correccion) {
      throw new NotFoundException(`Corrección con ID '${id}' no encontrada.`);
    }

    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!estudiante || estudiante.id !== correccion.estudiante.id) {
      throw new ForbiddenException(
        'Solo el estudiante que creó la corrección puede eliminarla.',
      );
    }

    if (correccion.observacion) {
      correccion.observacion.estado = EstadoObservacion.PENDIENTE;
      await this.repositorio_observacion.save(correccion.observacion);
    }

    await this.repositorio_correccion.remove(correccion);
    return { message: 'Corrección eliminada exitosamente.' };
  }
}