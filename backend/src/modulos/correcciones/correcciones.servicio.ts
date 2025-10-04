import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Correccion } from './entidades/correccion.entidad';
import { Repository } from 'typeorm';
import { CrearCorreccionDto } from './dto/crear-correccion.dto';
import { ActualizarCorreccionDto } from './dto/actualizar-correccion.dto';
import { Observacion } from '../observaciones/entidades/observacion.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Documento } from '../documentos/entidades/documento.entidad';
import { EstadoObservacion } from '../observaciones/enums/estado-observacion.enum';

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
  ) {}

  async crear(crear_correccion_dto: CrearCorreccionDto, id_usuario: number) {
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!estudiante) {
      throw new ForbiddenException('Solo los estudiantes pueden crear correcciones.');
    }

    const observacion = await this.repositorio_observacion.findOne({
      where: { id: crear_correccion_dto.id_observacion },
      relations: ['correccion'],
    });

    if (!observacion) {
      throw new NotFoundException(
        `Observación con ID '${crear_correccion_dto.id_observacion}' no encontrada.`,
      );
    }

    if (observacion.correccion) {
      throw new BadRequestException('Esta observación ya tiene una corrección asociada.');
    }

    const documento = await this.repositorio_documento.findOneBy({
      id: crear_correccion_dto.id_documento,
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID '${crear_correccion_dto.id_documento}' no encontrado.`);
    }

    const nueva_correccion = this.repositorio_correccion.create({
      ...crear_correccion_dto,
      observacion,
      estudiante,
      documento,
    });

    const correccion_guardada = await this.repositorio_correccion.save(nueva_correccion);

    observacion.estado = EstadoObservacion.CORREGIDO;
    await this.repositorio_observacion.save(observacion);

    return correccion_guardada;
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

  async obtenerPorEstudiante(id_usuario_estudiante: number) {
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario_estudiante } },
      relations: ['proyectos'],
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID de usuario '${id_usuario_estudiante}' no encontrado.`);
    }

    const proyectosIds = estudiante.proyectos.map((p) => p.id);

    if (proyectosIds.length === 0) {
      return [];
    }

    return this.repositorio_correccion
      .createQueryBuilder('correccion')
      .innerJoinAndSelect('correccion.documento', 'documento')
      .innerJoinAndSelect('correccion.estudiante', 'estudiante')
      .leftJoinAndSelect('correccion.observacion', 'observacion')
      .innerJoin('documento.proyecto', 'proyecto')
      .where('proyecto.id IN (:...proyectosIds)', { proyectosIds })
      .orderBy('correccion.fecha_creacion', 'DESC')
      .getMany();
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
      throw new ForbiddenException('Solo el estudiante que creó la corrección puede actualizarla.');
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
      throw new ForbiddenException('Solo el estudiante que creó la corrección puede eliminarla.');
    }

    if (correccion.observacion) {
      correccion.observacion.estado = EstadoObservacion.PENDIENTE;
      await this.repositorio_observacion.save(correccion.observacion);
    }

    await this.repositorio_correccion.remove(correccion);
    return { message: 'Corrección eliminada exitosamente.' };
  }
}