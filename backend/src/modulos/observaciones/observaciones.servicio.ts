import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observacion } from './entidades/observacion.entidad';
import { Repository } from 'typeorm';
import { CrearObservacionDto } from './dto/crear-observacion.dto';
import { Documento } from '../documentos/entidades/documento.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { ActualizarObservacionDto } from './dto/actualizar-observacion.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
import { EstadoObservacion } from './enums/estado-observacion.enum';

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

  async crear(id_documento: number, crear_observacion_dto: CrearObservacionDto, id_usuario: number) {
    const documento = await this.repositorio_documento.findOneBy({ id: id_documento });
    if (!documento) {
      throw new NotFoundException(`Documento con ID '${id_documento}' no encontrado.`);
    }

    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor) {
      throw new ForbiddenException('Solo los asesores pueden crear observaciones.');
    }

    const nueva_observacion = this.repositorio_observacion.create({
      ...crear_observacion_dto,
      documento,
      autor: asesor,
    });

    return this.repositorio_observacion.save(nueva_observacion);
  }

  async obtenerPorDocumento(id_documento: number, incluir_archivadas: boolean = false) {
    const condiciones: any = { documento: { id: id_documento } };
    
    if (!incluir_archivadas) {
      condiciones.archivada = false;
    }

    return this.repositorio_observacion.find({
      where: condiciones,
      relations: ['correccion', 'correccion.estudiante', 'autor'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async obtenerPorEstudiante(id_usuario_estudiante: number) {
    const estudiante = await this.repositorio_estudiante.findOne({ 
      where: { usuario: { id: id_usuario_estudiante } }, 
      relations: ['proyectos'] 
    });
  
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID de usuario '${id_usuario_estudiante}' no encontrado.`);
    }
  
    const proyectosIds = estudiante.proyectos.map(p => p.id);
  
    if (proyectosIds.length === 0) {
      return [];
    }
  
    return this.repositorio_observacion.createQueryBuilder('observacion')
      .innerJoinAndSelect('observacion.documento', 'documento')
      .innerJoinAndSelect('observacion.autor', 'autor')
      .leftJoinAndSelect('observacion.correccion', 'correccion')
      .innerJoin('documento.proyecto', 'proyecto')
      .where('proyecto.id IN (:...proyectosIds)', { proyectosIds })
      .andWhere('observacion.archivada = :archivada', { archivada: false })
      .orderBy('observacion.fecha_creacion', 'DESC')
      .getMany();
  }

  async obtenerPorProyecto(id_proyecto: number) {
    return this.repositorio_observacion
      .createQueryBuilder('observacion')
      .innerJoinAndSelect('observacion.documento', 'documento')
      .innerJoinAndSelect('observacion.autor', 'autor')
      .leftJoinAndSelect('observacion.correccion', 'correccion')
      .innerJoin('documento.proyecto', 'proyecto')
      .where('proyecto.id = :id_proyecto', { id_proyecto })
      .andWhere('observacion.archivada = :archivada', { archivada: false })
      .orderBy('observacion.fecha_creacion', 'DESC')
      .getMany();
  }

  async actualizar(id: number, actualizar_observacion_dto: ActualizarObservacionDto, id_usuario: number) {
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
      throw new ForbiddenException('Solo el asesor que creó la observación puede actualizarla.');
    }

    Object.assign(observacion, actualizar_observacion_dto);
    return this.repositorio_observacion.save(observacion);
  }

  async eliminar(id: number, id_usuario: number) {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id },
      relations: ['autor', 'correccion'],
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID '${id}' no encontrada.`);
    }

    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor || asesor.id !== observacion.autor.id) {
      throw new ForbiddenException('Solo el asesor que creó la observación puede eliminarla.');
    }

    if (observacion.correccion) {
      throw new BadRequestException('No se puede eliminar una observación que ya tiene una corrección asociada.');
    }

    await this.repositorio_observacion.remove(observacion);
    return { message: 'Observación eliminada exitosamente.' };
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
      throw new ForbiddenException('Solo el asesor que creó la observación puede archivarla.');
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
      throw new NotFoundException(`Observación archivada con ID '${id}' no encontrada.`);
    }

    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor || asesor.id !== observacion.autor.id) {
      throw new ForbiddenException('Solo el asesor que archivó la observación puede restaurarla.');
    }

    observacion.archivada = false;
    return this.repositorio_observacion.save(observacion);
  }

  async cambiarEstado(
    id: number, 
    id_usuario: number, 
    cambiarEstadoDto: CambiarEstadoDto
  ): Promise<Observacion> {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id },
      relations: ['autor', 'documento', 'documento.proyecto', 'correccion'],
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID '${id}' no encontrada.`);
    }

    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor || asesor.id !== observacion.autor.id) {
      throw new ForbiddenException('No tienes permisos para modificar esta observación');
    }

    this.validarTransicionEstado(observacion.estado, cambiarEstadoDto.estado);

    observacion.estado = cambiarEstadoDto.estado;
    if (cambiarEstadoDto.comentarios_asesor) {
      observacion.comentarios_asesor = cambiarEstadoDto.comentarios_asesor;
    }

    const observacionActualizada = await this.repositorio_observacion.save(observacion);

    return observacionActualizada;
  }

  private validarTransicionEstado(estadoActual: EstadoObservacion, nuevoEstado: EstadoObservacion): void {
    const transicionesValidas: { [key in EstadoObservacion]: EstadoObservacion[] } = {
      [EstadoObservacion.PENDIENTE]: [EstadoObservacion.EN_REVISION],
      [EstadoObservacion.EN_REVISION]: [
        EstadoObservacion.APROBADO, 
        EstadoObservacion.RECHAZADO
      ],
      [EstadoObservacion.CORREGIDO]: [EstadoObservacion.EN_REVISION],
      [EstadoObservacion.APROBADO]: [],
      [EstadoObservacion.RECHAZADO]: [EstadoObservacion.EN_REVISION]
    };

    const transicionesPermitidas = transicionesValidas[estadoActual] || [];
    
    if (!transicionesPermitidas.includes(nuevoEstado)) {
      throw new BadRequestException(
        `Transición inválida de ${estadoActual} a ${nuevoEstado}`
      );
    }
  }
}