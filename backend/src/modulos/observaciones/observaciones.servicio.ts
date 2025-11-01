/**
 * SERVICIO: Contiene toda la lógica de negocio para gestionar observaciones.
 * Maneja creación, actualización, cambio de estados, verificación y consultas de observaciones.
 */
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observacion } from './entidades/observacion.entidad';
import { Repository } from 'typeorm';
import { CrearObservacionDto } from './dto/crear-observacion.dto';
import { Documento } from '../documentos/entidades/documento.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { ActualizarObservacionDto } from './dto/actualizar-observacion.dto';
import { VerificarObservacionDto } from './dto/verificar-observacion.dto';
import { EstadoObservacion } from './enums/estado-observacion.enum';

import { CorreccionesService } from '../correcciones/correcciones.servicio';

@Injectable()
export class ObservacionesService {
  constructor(
    @InjectRepository(Observacion)
    private readonly repositorio_observacion: Repository<Observacion>,
    @InjectRepository(Documento)
    private readonly repositorio_documento: Repository<Documento>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
    
    private readonly correccionesService: CorreccionesService, 

    @InjectRepository(Estudiante)
    private readonly repositorio_estudiante: Repository<Estudiante>,
  ) {}

  // Crear una nueva observación
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
      version_observada: documento.version,
    });

    return this.repositorio_observacion.save(nueva_observacion);
  }

  // Obtener observaciones de un documento
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

  // Actualizar una observación
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

  // Archivar (borrado suave)
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

  // Restaurar una observación archivada
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

  // ✅ HISTORIA DE USUARIO: Cambiar estado de observación y notificar al estudiante
  async cambiarEstado(
    id: number, 
    id_usuario: number, 
    cambiarEstadoDto: ActualizarObservacionDto
  ): Promise<Observacion> {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id },
      relations: ['autor', 'documento', 'documento.proyecto', 'documento.proyecto.estudiantes'],
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID '${id}' no encontrada.`);
    }

    // ✅ Validar que el nuevo estado venga definido
    if (!cambiarEstadoDto.estado) {
      throw new BadRequestException('El nuevo estado de la observación es obligatorio.');
    }

    // ✅ Asignar estado inicial si no tiene uno
    if (observacion.estado === undefined) {
      observacion.estado = EstadoObservacion.PENDIENTE;
    }

    // ✅ Verificar permisos del asesor
    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor || asesor.id !== observacion.autor.id) {
      throw new ForbiddenException('No tienes permisos para modificar esta observación.');
    }

    // ✅ Validar la transición de estado
    this.validarTransicionEstado(observacion.estado, cambiarEstadoDto.estado);

    // ✅ Aplicar los cambios
    observacion.estado = cambiarEstadoDto.estado;
    if (cambiarEstadoDto.comentarios_asesor) {
      observacion.comentarios_asesor = cambiarEstadoDto.comentarios_asesor;
    }

    const observacionActualizada = await this.repositorio_observacion.save(observacion);

    // ✅ Notificar a los estudiantes
    const estudiantes = observacion.documento?.proyecto?.estudiantes || [];
    for (const estudiante of estudiantes) {
      console.log(`Notificando a estudiante ${estudiante.id}: Estado cambiado a ${cambiarEstadoDto.estado}`);
    }

    return observacionActualizada;
  }
  // Listar observaciones pendientes de verificación
  async listarPendientes(id_usuario: number): Promise<Observacion[]> {
    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor) {
      throw new ForbiddenException('Solo los asesores pueden listar observaciones pendientes.');
    }

    return this.repositorio_observacion.find({
      where: { 
        estado: EstadoObservacion.PENDIENTE,
        autor: { id: asesor.id }
      },
      relations: ['documento', 'autor'],
      order: { fecha_creacion: 'ASC' },
    });
  }

  // ✅ Verificar o rechazar una observación
async verificarObservacion(
    id: number,
    dto: VerificarObservacionDto,
    id_usuario: number,
  ): Promise<Observacion> {
    const obs = await this.repositorio_observacion.findOne({ 
      where: { id },
      relations: ['autor', 'documento']  
    });

    if (!obs) {
      throw new NotFoundException(`No se encontró la observación con id ${id}`);
    }

    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor || asesor.id !== obs.autor.id) {
      throw new ForbiddenException('Solo el asesor que creó la observación puede verificarla.');
    }

    // ✅ VALIDACIÓN CLAVE: ¿El estudiante corrigió en una versión válida?
    if (dto.nuevoEstado === EstadoObservacion.CORREGIDO) {
      if (!obs.version_corregida) {
        throw new BadRequestException('No se ha especificado en qué versión se corrigió la observación.');
      }
      
      // Verificar que la versión de corrección sea >= versión observada
      if (obs.version_corregida < (obs.version_observada || 1)) {
        throw new BadRequestException(
          `La versión de corrección (${obs.version_corregida}) debe ser mayor o igual a la versión observada (${obs.version_observada || 1}).`
        );
      }

      // Verificar que la versión de corrección no supere la versión actual del documento
      if (obs.version_corregida > obs.documento.version) {
        throw new BadRequestException(
          `La versión de corrección (${obs.version_corregida}) no puede ser mayor que la versión actual del documento (${obs.documento.version}).`
        );
      }
    }

    obs.estado = dto.nuevoEstado;
    if (dto.verificacion_asesor) {
      obs.comentario_verificacion = dto.verificacion_asesor;
    }
    obs.fecha_verificacion = new Date();

    return await this.repositorio_observacion.save(obs);
  }
  // ============ MÉTODOS PARA CORRECCIONES ============

  async crearCorreccion(
    observacionId: number,
    crearCorreccionDto: any, // Importa el DTO correcto
    id_usuario: number
  ) {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id: observacionId },
      relations: ['documento', 'documento.proyecto', 'documento.proyecto.estudiantes']
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID ${observacionId} no encontrada`);
    }

    // Verificar que el usuario es estudiante del proyecto
    const esEstudiante = observacion.documento?.proyecto?.estudiantes?.some(
      est => est.usuario?.id === id_usuario
    );

    if (!esEstudiante) {
      throw new ForbiddenException('Solo los estudiantes del proyecto pueden crear correcciones');
    }

    // Aquí deberías crear la entidad Correccion en tu sistema
    // Por ahora retorno un placeholder
    return {
      message: 'Corrección creada exitosamente',
      observacionId,
      descripcion: crearCorreccionDto.descripcion
    };
  }

  async marcarCorreccionCompletada(
    observacionId: number,
    marcarCorreccionDto: any,
    id_usuario: number
  ) {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id: observacionId },
      relations: ['documento', 'documento.proyecto', 'documento.proyecto.estudiantes']
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID ${observacionId} no encontrada`);
    }

    const esEstudiante = observacion.documento?.proyecto?.estudiantes?.some(
      est => est.usuario?.id === id_usuario
    );

    if (!esEstudiante) {
      throw new ForbiddenException('Solo los estudiantes pueden marcar correcciones como completadas');
    }

    // observacion.version_corregida = marcarCorreccionDto.version_corregida;
    // observacion.estado = EstadoObservacion.CORREGIDO;
    

    observacion.version_corregida = marcarCorreccionDto.version_corregida || observacion.documento.version;
    observacion.estado = EstadoObservacion.CORREGIDO;
    return await this.repositorio_observacion.save(observacion);
  }

  async verificarCorreccion(
    observacionId: number,
    verificarCorreccionDto: any,
    id_usuario: number
  ) {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id: observacionId },
      relations: ['autor']
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID ${observacionId} no encontrada`);
    }

    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } }
    });

    if (!asesor || asesor.id !== observacion.autor.id) {
      throw new ForbiddenException('Solo el asesor que creó la observación puede verificar correcciones');
    }

    observacion.estado = verificarCorreccionDto.resultado;
    observacion.comentario_verificacion = verificarCorreccionDto.comentario_verificacion;
    observacion.fecha_verificacion = new Date();

    return await this.repositorio_observacion.save(observacion);
  }

  // ============ MÉTODOS DE CONSULTA ============
  // En observaciones.servicio.ts
  async obtenerObservacionesDelAsesor(id_usuario: number): Promise<Observacion[]> {
    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor) {
      throw new ForbiddenException('Solo los asesores pueden acceder a sus observaciones.');
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
      .where('documento.proyecto.id = :proyectoId', { proyectoId })
      .orderBy('observacion.fecha_creacion', 'DESC')
      .getMany();
  }

  async obtenerEstadisticasPorDocumento(documentoId: number, id_usuario: number) {
    const observaciones = await this.repositorio_observacion.find({
      where: { documento: { id: documentoId } }
    });

    const estadisticas = {
      total: observaciones.length,
      pendientes: observaciones.filter(o => o.estado === EstadoObservacion.PENDIENTE).length,
      corregidas: observaciones.filter(o => o.estado === EstadoObservacion.CORREGIDO).length,
      rechazadas: observaciones.filter(o => o.estado === EstadoObservacion.RECHAZADO).length,
    };

    return {
      documentoId,
      estadisticas,
      porcentaje_completado: estadisticas.total > 0 
        ? Math.round(((estadisticas.corregidas) / estadisticas.total) * 100) 
        : 0
    };
  }

  async obtenerObservacionesPorRevisor(revisorId: number, id_usuario: number) {
    const asesor = await this.repositorio_asesor.findOne({
      where: { id: revisorId }
    });

    if (!asesor) {
      throw new NotFoundException(`Asesor con ID ${revisorId} no encontrado`);
    }

    return await this.repositorio_observacion.find({
      where: { autor: { id: revisorId } },
      relations: ['documento', 'documento.proyecto'],
      order: { fecha_creacion: 'DESC' }
    });
  }

  async obtenerObservacionPorId(id: number, id_usuario: number) {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id },
      relations: ['autor', 'documento', 'documento.proyecto', 'correccion']
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID ${id} no encontrada`);
    }

    return observacion;
  }

  async eliminarObservacion(id: number, id_usuario: number) {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id },
      relations: ['autor']
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID ${id} no encontrada`);
    }

    // Verificar permisos (solo el autor o un admin puede eliminar)
    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } }
    });

    if (!asesor || asesor.id !== observacion.autor.id) {
      throw new ForbiddenException('Solo el autor de la observación puede eliminarla');
    }

    await this.repositorio_observacion.remove(observacion);
  }
  
  async obtenerPorEstudiante(id_usuario: number) {
    // 1. Verificar que el usuario sea un estudiante
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
      // relations: ['usuario'],
      relations: ['proyecto'],
    });

    if (!estudiante) {
      throw new ForbiddenException('Solo los estudiantes pueden acceder a sus observaciones.');
    }
    
    if (!estudiante.proyecto) {
      return []; // ✅ Sin proyecto = sin observaciones
    }

    return this.repositorio_observacion.find({
      where: {
        documento: {
          proyecto: { id: estudiante.proyecto.id }
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
      ],
      order: { fecha_creacion: 'DESC' },
    });
  }

  // Validar transiciones de estado permitidas
  private validarTransicionEstado(estadoActual: EstadoObservacion, nuevoEstado: EstadoObservacion): void {
    const transicionesValidas: { [key in EstadoObservacion]: EstadoObservacion[] } = {
      [EstadoObservacion.PENDIENTE]
      : [
        EstadoObservacion.CORREGIDO, 
        
        EstadoObservacion.RECHAZADO
      ],
      [EstadoObservacion.CORREGIDO]:
      [],
      [EstadoObservacion.RECHAZADO]: [EstadoObservacion.PENDIENTE],
      
    };

    const transicionesPermitidas = transicionesValidas[estadoActual] || [];
    
    if (!transicionesPermitidas.includes(nuevoEstado)) {
      throw new BadRequestException(
        `Transición inválida de ${estadoActual} a ${nuevoEstado}`
      );
    }
  }
}