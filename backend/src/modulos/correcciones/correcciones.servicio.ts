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

/**
 * SERVICIO: Gestión completa de correcciones
 * 
 * VERSIÓN FUSIONADA:
 * - Incluye métodos de la versión original (crear, obtener, actualizar, eliminar)
 * - Incluye métodos nuevos (marcarCompletada, verificar)
 * - Mantiene compatibilidad con endpoints existentes
 * - Agrega funcionalidad para el flujo completo de HU-06
 */
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

  // ==================== MÉTODOS PRINCIPALES ====================

  /**
   * VERSIÓN ORIGINAL (de tus compañeros)
   * Crear corrección desde endpoint independiente POST /correcciones
   * 
   * USO: Cuando el endpoint es independiente y recibe id_observacion e id_documento en el body
   */
  async crear(crear_correccion_dto: CrearCorreccionDto, id_usuario: number) {
    // 1. Validar que el usuario es estudiante
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!estudiante) {
      throw new ForbiddenException('Solo los estudiantes pueden crear correcciones.');
    }

    // 2. Buscar la observación (si viene id_observacion en el DTO)
    // NOTA: Según el DTO fusionado, id_observacion NO viene en el body
    // Si tu controller lo envía, descomenta esto:
    /*
    const observacion = await this.repositorio_observacion.findOne({
      where: { id: crear_correccion_dto.id_observacion },
      relations: ['correccion', 'documento', 'documento.proyecto', 'documento.proyecto.estudiantes'],
    });

    if (!observacion) {
      throw new NotFoundException(
        `Observación con ID '${crear_correccion_dto.id_observacion}' no encontrada.`,
      );
    }

    if (observacion.correccion) {
      throw new BadRequestException('Esta observación ya tiene una corrección asociada.');
    }

    // Validar que el estudiante pertenece al proyecto
    const esEstudiante = observacion.documento?.proyecto?.estudiantes?.some(
      (est) => est.id === estudiante.id,
    );

    if (!esEstudiante) {
      throw new ForbiddenException(
        'Solo los estudiantes del proyecto pueden crear correcciones para esta observación',
      );
    }
    */

    // 3. Buscar el documento (si viene id_documento en el DTO)
    // NOTA: Según el DTO fusionado, id_documento NO viene en el body
    // Si tu controller lo envía, descomenta esto:
    /*
    const documento = await this.repositorio_documento.findOneBy({
      id: crear_correccion_dto.id_documento,
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID '${crear_correccion_dto.id_documento}' no encontrado.`);
    }
    */

    // 4. Crear la corrección
    const nueva_correccion = this.repositorio_correccion.create({
      ...crear_correccion_dto,
      // observacion,  // Descomenta si usas observacion
      estudiante,
      // documento,    // Descomenta si usas documento
    });

    const correccion_guardada = await this.repositorio_correccion.save(nueva_correccion);

    // 5. Actualizar estado de la observación (si aplica)
    /*
    if (observacion) {
      observacion.estado = EstadoObservacion.CORREGIDO;
      observacion.version_corregida = crear_correccion_dto.version_corregida;
      await this.repositorio_observacion.save(observacion);
    }
    */

    return correccion_guardada;
  }

  /**
   * VERSIÓN NUEVA (para ObservacionesController)
   * Crear corrección desde endpoint POST /observaciones/:id/correccion
   * 
   * USO: Cuando el observacionId viene en la URL del endpoint
   */
  async crearPorObservacion(
    observacionId: number,
    crear_correccion_dto: CrearCorreccionDto,
    id_usuario: number,
  ): Promise<Correccion> {
    // 1. Buscar la observación con todas sus relaciones
    const observacion = await this.repositorio_observacion.findOne({
      where: { id: observacionId },
      relations: ['documento', 'documento.proyecto', 'documento.proyecto.estudiantes', 'correccion'],
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID ${observacionId} no encontrada`);
    }

    // 2. Validar que la observación esté en estado válido
    if (
      observacion.estado !== EstadoObservacion.PENDIENTE &&
      observacion.estado !== EstadoObservacion.RECHAZADO
    ) {
      throw new BadRequestException(
        `No se puede crear una corrección para una observación en estado ${observacion.estado}`,
      );
    }

    // 3. Validar que no exista ya una corrección
    if (observacion.correccion) {
      throw new BadRequestException(
        'Esta observación ya tiene una corrección asociada. Use el endpoint de actualización.',
      );
    }

    // 4. Verificar que el usuario es estudiante del proyecto
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!estudiante) {
      throw new ForbiddenException('Solo los estudiantes pueden crear correcciones');
    }

    const esEstudiante = observacion.documento?.proyecto?.estudiantes?.some(
      (est) => est.id === estudiante.id,
    );

    if (!esEstudiante) {
      throw new ForbiddenException(
        'Solo los estudiantes del proyecto pueden crear correcciones para esta observación',
      );
    }

    // 5. Crear la corrección
    const nuevaCorreccion = this.repositorio_correccion.create({
      ...crear_correccion_dto,
      observacion,
      estudiante,
      documento: observacion.documento,
    });

    const correccionGuardada = await this.repositorio_correccion.save(nuevaCorreccion);

    // 6. Actualizar la observación con la version_corregida
    observacion.version_corregida = crear_correccion_dto.version_corregida;
    // NO cambiar estado aún, esperar verificación del asesor
    await this.repositorio_observacion.save(observacion);

    return correccionGuardada;
  }

  /**
   * Marcar una corrección como completada (actualizar versión)
   * El estudiante puede actualizar la versión en la que corrigió
   */
  async marcarCompletada(
    observacionId: number,
    dto: MarcarCorregidoDto,
    id_usuario: number,
  ): Promise<Correccion> {
    // 1. Buscar la observación con su corrección
    const observacion = await this.repositorio_observacion.findOne({
      where: { id: observacionId },
      relations: ['correccion', 'correccion.estudiante'],
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID ${observacionId} no encontrada`);
    }

    if (!observacion.correccion) {
      throw new NotFoundException(
        'Esta observación no tiene una corrección asociada. Cree una primero.',
      );
    }

    // 2. Validar que el usuario sea el estudiante autor de la corrección
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!estudiante || estudiante.id !== observacion.correccion.estudiante.id) {
      throw new ForbiddenException(
        'Solo el estudiante que creó la corrección puede marcarla como completada',
      );
    }

    // 3. Actualizar la corrección
    observacion.correccion.version_corregida = dto.version_corregida;
    if (dto.comentario) {
      observacion.correccion.descripcion = dto.comentario;
    }

    const correccionActualizada = await this.repositorio_correccion.save(observacion.correccion);

    // 4. Actualizar también la observación
    observacion.version_corregida = dto.version_corregida;
    await this.repositorio_observacion.save(observacion);

    return correccionActualizada;
  }

  /**
   * Verificar una corrección (aceptar o rechazar) - ASESOR
   * Solo el asesor autor de la observación puede verificar
   */
  async verificar(
    observacionId: number,
    dto: VerificarCorreccionDto,
    id_usuario: number,
  ): Promise<Correccion> {
    // 1. Buscar la observación con su corrección y autor
    const observacion = await this.repositorio_observacion.findOne({
      where: { id: observacionId },
      relations: ['correccion', 'correccion.estudiante', 'autor'],
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID ${observacionId} no encontrada`);
    }

    if (!observacion.correccion) {
      throw new NotFoundException(
        'Esta observación no tiene una corrección para verificar',
      );
    }

    // 2. Validar que el usuario sea el asesor autor de la observación
    const asesor = await this.repositorio_asesor.findOne({
      where: { usuario: { id: id_usuario } },
    });

    if (!asesor || asesor.id !== observacion.autor.id) {
      throw new ForbiddenException(
        'Solo el asesor que creó la observación puede verificar la corrección',
      );
    }

    // 3. Actualizar la corrección
    observacion.correccion.estado_verificacion = 
      dto.resultado === EstadoObservacion.CORREGIDO ? 'APROBADA' : 'RECHAZADA';
    observacion.correccion.comentario_verificacion = dto.comentario_verificacion;
    observacion.correccion.fecha_verificacion = new Date();

    const correccionActualizada = await this.repositorio_correccion.save(observacion.correccion);

    // 4. Actualizar el estado de la observación según el resultado
    observacion.estado = dto.resultado;
    observacion.fecha_verificacion = new Date();
    observacion.comentario_verificacion = dto.comentario_verificacion;

    await this.repositorio_observacion.save(observacion);

    return correccionActualizada;
  }

  // ==================== MÉTODOS DE CONSULTA (ORIGINALES) ====================

  /**
   * Obtener todas las correcciones de un documento
   */
  async obtenerPorDocumento(id_documento: number) {
    return this.repositorio_correccion.find({
      where: { documento: { id: id_documento } },
      relations: ['observacion', 'estudiante', 'documento'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  /**
   * Obtener todas las correcciones de un proyecto
   */
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

  /**
   * Obtener todas las correcciones de un estudiante
   */
  // observaciones.servicio.ts

async obtenerPorEstudiante(id_usuario: number) {
  const estudiante = await this.repositorio_estudiante.findOne({
    where: { usuario: { id: id_usuario } },
    relations: ['usuario'],
  });

  if (!estudiante) {
    throw new ForbiddenException('Solo los estudiantes pueden acceder a sus observaciones.');
  }

  return await this.repositorio_observacion
    .createQueryBuilder('observacion')
    .innerJoin('observacion.documento', 'documento')
    .innerJoin('documento.proyecto', 'proyecto')
    .innerJoin('proyecto.estudiantes', 'est') // ← aquí va
    .where('est.id = :estudianteId', { estudianteId: estudiante.id })
    .andWhere('observacion.archivada = false')
    .orderBy('observacion.fecha_creacion', 'DESC')
    .getMany();
}

  /**
   * Obtener una corrección por ID de observación
   */
  async obtenerPorObservacion(observacionId: number, id_usuario: number): Promise<Correccion> {
    const observacion = await this.repositorio_observacion.findOne({
      where: { id: observacionId },
      relations: ['correccion', 'correccion.estudiante'],
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID ${observacionId} no encontrada`);
    }

    if (!observacion.correccion) {
      throw new NotFoundException('Esta observación no tiene una corrección asociada');
    }

    return observacion.correccion;
  }

  /**
   * Listar todas las correcciones de un estudiante (alternativa)
   */
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

  // ==================== MÉTODOS DE ACTUALIZACIÓN Y ELIMINACIÓN ====================

  /**
   * Actualizar una corrección existente
   */
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

  /**
   * Eliminar una corrección
   */
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

    // Revertir estado de la observación si existe
    if (correccion.observacion) {
      correccion.observacion.estado = EstadoObservacion.PENDIENTE;
      await this.repositorio_observacion.save(correccion.observacion);
    }

    await this.repositorio_correccion.remove(correccion);
    return { message: 'Corrección eliminada exitosamente.' };
  }
}

/**
 * NOTAS IMPORTANTES:
 * 
 * 1. COMPATIBILIDAD:
 *    - Método crear() mantiene compatibilidad con controller original
 *    - Método crearPorObservacion() para el nuevo flujo de HU-06
 * 
 * 2. NUEVOS MÉTODOS:
 *    - marcarCompletada(): Para que el estudiante actualice la versión
 *    - verificar(): Para que el asesor apruebe/rechace
 * 
 * 3. ESTADO DE OBSERVACIÓN:
 *    - crear(): Originalmente cambiaba a CORREGIDO inmediatamente
 *    - crearPorObservacion(): NO cambia estado, espera verificación
 *    - verificar(): Cambia según resultado del asesor
 * 
 * 4. VALIDACIONES:
 *    - Verifica que el estudiante pertenezca al proyecto
 *    - Verifica que el asesor sea el autor de la observación
 *    - Valida transiciones de estado
 * 
 * 5. PARA INTEGRAR CON OBSERVACIONES:
 *    En ObservacionesService, usar:
 *    - crearPorObservacion() para POST /observaciones/:id/correccion
 *    - marcarCompletada() para PATCH /observaciones/:id/correccion/marcar
 *    - verificar() para PATCH /observaciones/:id/correccion/verificar
 */