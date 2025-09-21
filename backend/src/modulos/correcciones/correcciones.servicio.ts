import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Correccion } from './entidades/correccion.entidad';
import { CrearCorreccionDto } from './dto/crear-correccion.dto';
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
    const { id_observacion, id_documento, ...datos_correccion } = crear_correccion_dto;

    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!estudiante) {
      throw new ForbiddenException('Solo los estudiantes pueden crear correcciones.');
    }

    const observacion = await this.repositorio_observacion.findOne({
      where: { id: id_observacion },
      relations: ['correccion'],
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID '${id_observacion}' no encontrada.`);
    }

    if (observacion.correccion) {
      throw new BadRequestException('Esta observación ya tiene una corrección asignada.');
    }

    const documento = await this.repositorio_documento.findOneBy({ id: id_documento });
    if (!documento) {
      throw new NotFoundException(`Documento con ID '${id_documento}' no encontrado.`);
    }

    const nueva_correccion = this.repositorio_correccion.create({
      ...datos_correccion,
      observacion,
      estudiante,
      documento,
    });

    const correccion_guardada = await this.repositorio_correccion.save(nueva_correccion);

    observacion.estado = EstadoObservacion.Corregida;
    await this.repositorio_observacion.save(observacion);

    return correccion_guardada;
  }

  async obtenerPorDocumento(id_documento: number) {
    return this.repositorio_correccion.find({
      where: { documento: { id: id_documento } },
      relations: ['observacion', 'estudiante'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async obtenerPorObservacion(id_observacion: number) {
    return this.repositorio_correccion.findOne({
      where: { observacion: { id: id_observacion } },
      relations: ['estudiante'],
    });
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
      correccion.observacion.estado = EstadoObservacion.Pendiente;
      await this.repositorio_observacion.save(correccion.observacion);
    }

    await this.repositorio_correccion.remove(correccion);
    return { message: 'Corrección eliminada exitosamente.' };
  }
}