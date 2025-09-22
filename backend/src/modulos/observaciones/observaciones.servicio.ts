import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observacion } from './entidades/observacion.entidad';
import { Repository } from 'typeorm';
import { CrearObservacionDto } from './dto/crear-observacion.dto';
import { Documento } from '../documentos/entidades/documento.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { ActualizarObservacionDto } from './dto/actualizar-observacion.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto'; // Asumimos que este DTO existe o lo creamos basado en el primer bloque

// Asumimos que la entidad Observacion tiene un campo 'estado' de tipo EstadoObservacion
// Importamos el enum EstadoObservacion (ajusta la ruta si es necesario)
import { EstadoObservacion } from './enums/estado-observacion.enum'; // Asegúrate de que exista en la entidad

// Opcional: Si necesitas un servicio de notificaciones, inyéctalo aquí
// import { NotificacionesService } from '../notificaciones/notificaciones.service';

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
    // Opcional: @Inject(NotificacionesService) private readonly notificacionesService: NotificacionesService,
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
      relations: ['correccion', 'correccion.estudiante'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async obtenerPorEstudiante(id_usuario_estudiante: number) {
    const estudiante = await this.repositorio_estudiante.findOne({ where: { usuario: { id: id_usuario_estudiante } }, relations: ['proyectos'] });
  
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID de usuario '${id_usuario_estudiante}' no encontrado.`);
    }
  
    const proyectosIds = estudiante.proyectos.map(p => p.id);
  
    if (proyectosIds.length === 0) {
      return [];
    }
  
    return this.repositorio_observacion.createQueryBuilder('observacion')
      .innerJoinAndSelect('observacion.documento', 'documento')
      .innerJoin('documento.proyecto', 'proyecto')
      .where('proyecto.id IN (:...proyectosIds)', { proyectosIds })
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

  // Nueva función: Cambiar estado de observación, adaptada del primer bloque
  async cambiarEstado(
    id: number, 
    id_usuario: number, 
    cambiarEstadoDto: CambiarEstadoDto
  ): Promise<Observacion> {
    // Obtener la observación con relaciones necesarias
    const observacion = await this.repositorio_observacion.findOne({
      where: { id },
      relations: ['autor', 'documento', 'documento.proyecto', 'documento.proyecto.estudiantes'], // Ajusta relaciones según tu modelo para notificar
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID '${id}' no encontrada.`);
    }

    // Verificar que el asesor tiene permisos (adaptado del primer bloque)
    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor || asesor.id !== observacion.autor.id) {
      throw new ForbiddenException('No tienes permisos para modificar esta observación');
    }

    // Validar transición de estados (copiado y adaptado del primer bloque)
    this.validarTransicionEstado(observacion.estado, cambiarEstadoDto.estado);

    // Actualizar la observación
    observacion.estado = cambiarEstadoDto.estado;
    if (cambiarEstadoDto.comentarios_asesor) {
      observacion.comentarios_asesor = cambiarEstadoDto.comentarios_asesor;
    }

    const observacionActualizada = await this.repositorio_observacion.save(observacion);

    // Lógica de notificación al estudiante (ejemplo básico)
    // Asumimos que hay estudiantes asociados al proyecto del documento
    const estudiantes = observacion.documento?.proyecto?.estudiantes || [];
    for (const estudiante of estudiantes) {
      // Aquí integra tu sistema de notificaciones, e.g.:
      // await this.notificacionesService.enviarNotificacion(estudiante.usuario.id, `La observación ${id} ha cambiado a ${cambiarEstadoDto.estado}. Progreso de correcciones actualizado.`);
      console.log(`Notificando a estudiante ${estudiante.id}: Estado cambiado a ${cambiarEstadoDto.estado}`); // Placeholder; reemplaza con notificación real
    }

    return observacionActualizada;
  }

  // Método auxiliar para validar transiciones de estado (copiado del primer bloque)
  private validarTransicionEstado(estadoActual: EstadoObservacion, nuevoEstado: EstadoObservacion): void {
  const transicionesValidas: { [key in EstadoObservacion]: EstadoObservacion[] } = {  // Tipado explícito aquí
    [EstadoObservacion.PENDIENTE]: [EstadoObservacion.EN_REVISION],
    [EstadoObservacion.EN_REVISION]: [
      EstadoObservacion.CORREGIDO, 
      EstadoObservacion.APROBADO, 
      EstadoObservacion.RECHAZADO
    ],
    [EstadoObservacion.CORREGIDO]: [EstadoObservacion.EN_REVISION],
    [EstadoObservacion.APROBADO]: [], // Estado final
    [EstadoObservacion.RECHAZADO]: [EstadoObservacion.PENDIENTE]
  };

  const transicionesPermitidas = transicionesValidas[estadoActual] || [];  // Ahora inferido como EstadoObservacion[]
  
  if (!transicionesPermitidas.includes(nuevoEstado)) {
    throw new BadRequestException(
      `Transición inválida de ${estadoActual} a ${nuevoEstado}`
    );
  }
}
}
