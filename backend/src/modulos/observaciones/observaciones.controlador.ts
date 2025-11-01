/**
 * CONTROLADOR: Define todas las rutas HTTP para el módulo de observaciones.
 * Maneja las peticiones, valida datos con DTOs y delega la lógica al servicio.
 */
import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards, Request, Delete,HttpStatus,HttpCode} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { ObservacionesService } from './observaciones.servicio';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';

// DTOs
import { CrearObservacionDto } from './dto/crear-observacion.dto';
import { ActualizarObservacionDto } from './dto/actualizar-observacion.dto';
import { CrearCorreccionDto } from '../correcciones/dto/crear-correccion.dto';
import { MarcarCorregidoDto } from '../correcciones/dto/marcar-correccion.dto';
import { VerificarCorreccionDto } from '../correcciones/dto/verificar-correccion.dto';
import { VerificarObservacionDto } from './dto/verificar-observacion.dto';

@ApiTags('observaciones')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('observaciones')
export class ObservacionesController {
  constructor(
    private readonly servicio_observaciones: ObservacionesService
  ) {}

  // ============ ENDPOINTS BÁSICOS DE OBSERVACIONES ============

  @Post(':documentoId/crear')
  @ApiOperation({ summary: 'Crear una nueva observación para un documento' })
  @ApiParam({ name: 'documentoId', description: 'ID numérico del documento a comentar' })
  @ApiResponse({ status: 201, description: 'Observación creada exitosamente.' })
  @ApiResponse({ status: 404, description: 'El documento no fue encontrado.' })
  @ApiResponse({ status: 403, description: 'Solo los asesores pueden crear observaciones.' })
  crear(
    @Param('documentoId', ParseIntPipe) documentoId: number,
    @Body() crear_observacion_dto: CrearObservacionDto,
    @Request() req,
  ) {
    return this.servicio_observaciones.crear(documentoId, crear_observacion_dto, req.user.id_usuario);
  }
    
  @Get('por-documento/:documentoId')
  @ApiOperation({ summary: 'Obtener todas las observaciones de un documento' })
  @ApiParam({ name: 'documentoId', description: 'ID numérico del documento' })
  @ApiQuery({ name: 'incluir_archivadas', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de observaciones del documento.' })
  obtenerPorDocumento(
    @Param('documentoId', ParseIntPipe) documentoId: number,
    @Query('incluir_archivadas') incluir_archivadas?: boolean,
  ) {
    return this.servicio_observaciones.obtenerPorDocumento(documentoId, incluir_archivadas);
  }
  
  @Get('mias')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener todas las observaciones creadas por el asesor' })
  @ApiResponse({ status: 200, description: 'Lista de observaciones del asesor.' })
  async obtenerObservacionesDelAsesor(@Request() req) {
    return await this.servicio_observaciones.obtenerObservacionesDelAsesor(req.user.id_usuario);
  }

  @Get('por-estudiante')
  @ApiOperation({ summary: 'Obtener todas las observaciones de un estudiante' })
  @ApiResponse({ status: 200, description: 'Lista de observaciones del estudiante.' })
  obtenerPorEstudiante(@Request() req) {
    return this.servicio_observaciones.obtenerPorEstudiante(req.user.id_usuario);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar el estado de una observación' })
  @ApiParam({ name: 'id', description: 'ID numérico de la observación a actualizar' })
  @ApiResponse({ status: 200, description: 'Estado de la observación actualizado.' })
  @ApiResponse({ status: 404, description: 'Observación no encontrada.' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para actualizar esta observación.' })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizar_observacion_dto: ActualizarObservacionDto,
    @Request() req,
  ) {
    return this.servicio_observaciones.actualizar(id, actualizar_observacion_dto, req.user.id_usuario);
  }

  @Patch(':id/archivar')
  @ApiOperation({ summary: 'Archivar una observación (borrado suave)' })
  @ApiParam({ name: 'id', description: 'ID de la observación a archivar' })
  @ApiResponse({ status: 200, description: 'Observación archivada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Observación no encontrada.' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para archivar esta observación.' })
  archivar(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.servicio_observaciones.archivar(id, req.user.id_usuario);
  }

  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar una observación archivada' })
  @ApiParam({ name: 'id', description: 'ID de la observación a restaurar' })
  @ApiResponse({ status: 200, description: 'Observación restaurada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Observación archivada no encontrada.' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para restaurar esta observación.' })
  restaurar(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.servicio_observaciones.restaurar(id, req.user.id_usuario);
  }

  // ============ HISTORIA DE USUARIO: CAMBIAR ESTADO ============

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar el estado de una observación y notificar al estudiante' })
  @ApiParam({ name: 'id', description: 'ID numérico de la observación a cambiar estado' })
  @ApiResponse({ status: 200, description: 'Estado cambiado exitosamente y notificación enviada.' })
  @ApiResponse({ status: 404, description: 'Observación no encontrada.' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para modificar esta observación.' })
  @ApiResponse({ status: 400, description: 'Transición de estado inválida.' })
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarObservacionEstadoDto: ActualizarObservacionDto,
    @Request() req,
  ): Promise<{
    message: string;
    observacion: any;
  }> {
    const observacionActualizada = await this.servicio_observaciones.cambiarEstado(
      id, 
      req.user.id_usuario, 
      actualizarObservacionEstadoDto
    );

    return {
      message: `Estado cambiado a "${actualizarObservacionEstadoDto.estado}" exitosamente. El estudiante ha sido notificado sobre el progreso de sus correcciones.`,
      observacion: observacionActualizada
    };
  }

  // ============ ENDPOINTS PARA CORRECCIONES ============

  @Post(':id/correccion')
  @ApiOperation({ summary: 'Crear corrección para una observación' })
  @ApiParam({ name: 'id', description: 'ID de la observación' })
  @ApiResponse({ status: 201, description: 'Corrección creada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Observación no encontrada.' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para crear corrección.' })
  async crearCorreccion(
    @Param('id', ParseIntPipe) observacionId: number,
    @Body() crearCorreccionDto: CrearCorreccionDto,
    @Request() req
  ) {
    return await this.servicio_observaciones.crearCorreccion(
      observacionId, 
      crearCorreccionDto,
      req.user.id_usuario
    );
  }

  @Patch(':id/correccion/marcar')
  @ApiOperation({ summary: 'Marcar corrección como completada por el estudiante' })
  @ApiParam({ name: 'id', description: 'ID de la observación' })
  @ApiResponse({ status: 200, description: 'Corrección marcada como completada.' })
  @ApiResponse({ status: 404, description: 'Observación no encontrada.' })
  @ApiResponse({ status: 403, description: 'Solo el estudiante puede marcar correcciones.' })
  async marcarCorreccionCompletada(
    @Param('id', ParseIntPipe) observacionId: number,
    @Body() marcarCorreccionDto: MarcarCorregidoDto,
    @Request() req
  ) {
    return await this.servicio_observaciones.marcarCorreccionCompletada(
      observacionId, 
      marcarCorreccionDto,
      req.user.id_usuario
    );
  }

  @Patch(':id/correccion/verificar')
  @ApiOperation({ summary: 'Verificar corrección por parte del revisor' })
  @ApiParam({ name: 'id', description: 'ID de la observación' })
  @ApiResponse({ status: 200, description: 'Corrección verificada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Observación no encontrada.' })
  @ApiResponse({ status: 403, description: 'Solo el revisor puede verificar correcciones.' })
  async verificarCorreccion(
    @Param('id', ParseIntPipe) observacionId: number,
    @Body() verificarCorreccionDto: VerificarCorreccionDto,
    @Request() req
  ) {
    return await this.servicio_observaciones.verificarCorreccion(
      observacionId, 
      verificarCorreccionDto,
      req.user.id_usuario
    );
  }

  // ============ ENDPOINTS DE VERIFICACIÓN ============


  @Patch('verificacion/:id')
  @ApiOperation({ summary: 'Verificar/Rechazar observación' })
  @ApiParam({ name: 'id', description: 'ID de la observación' })
  @ApiResponse({ status: 200, description: 'Observación verificada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Observación no encontrada.' })
  async verificarObservacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerificarObservacionDto,
    @Request() req
  ) {
    return await this.servicio_observaciones.verificarObservacion(id, dto, req.user.id_usuario);
  }

  // ============ ENDPOINTS DE CONSULTA Y REPORTES ============

  @Get('proyecto/:proyectoId')
  @ApiOperation({ summary: 'Obtener todas las observaciones de un proyecto' })
  @ApiParam({ name: 'proyectoId', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Lista de observaciones del proyecto.' })
  async obtenerObservacionesPorProyecto(
    @Param('proyectoId', ParseIntPipe) proyectoId: number,
    @Request() req
  ) {
    return await this.servicio_observaciones.obtenerObservacionesPorProyecto(
      proyectoId,
      req.user.id_usuario
    );
  }

  @Get('usuario/:usuarioId/pendientes')
  @ApiOperation({ summary: 'Obtener observaciones pendientes de un usuario' })
  @ApiParam({ name: 'usuarioId', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de observaciones pendientes.' })


  @Get('estadisticas/documento/:documentoId')
  @ApiOperation({ summary: 'Obtener estadísticas de observaciones por documento' })
  @ApiParam({ name: 'documentoId', description: 'ID del documento' })
  @ApiResponse({ status: 200, description: 'Estadísticas del documento.' })
  async obtenerEstadisticasPorDocumento(
    @Param('documentoId', ParseIntPipe) documentoId: number,
    @Request() req
  ) {
    return await this.servicio_observaciones.obtenerEstadisticasPorDocumento(
      documentoId,
      req.user.id_usuario
    );
  }

  @Get('revision/:revisorId')
  @ApiOperation({ summary: 'Obtener observaciones realizadas por un revisor' })
  @ApiParam({ name: 'revisorId', description: 'ID del revisor' })
  @ApiResponse({ status: 200, description: 'Lista de observaciones del revisor.' })
  async obtenerObservacionesPorRevisor(
    @Param('revisorId', ParseIntPipe) revisorId: number,
    @Request() req
  ) {
    return await this.servicio_observaciones.obtenerObservacionesPorRevisor(
      revisorId,
      req.user.id_usuario
    );
  }
  
  @Get('revision/pendientes')
  @ApiOperation({ summary: 'Listar observaciones pendientes por revisor' })
  @ApiResponse({ status: 200, description: 'Lista de observaciones pendientes.' })
  async listarObservacionesPendientesRevisor(@Request() req) { // ✅ Nombre único
    return await this.servicio_observaciones.listarPendientes(req.user.id_usuario);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener observación por ID' })
  @ApiParam({ name: 'id', description: 'ID de la observación' })
  @ApiResponse({ status: 200, description: 'Detalle de la observación.' })
  @ApiResponse({ status: 404, description: 'Observación no encontrada.' })
  async obtenerObservacionPorId(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ) {
    return await this.servicio_observaciones.obtenerObservacionPorId(id, req.user.id_usuario);
  }
  

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar observación (solo administradores)' })
  @ApiParam({ name: 'id', description: 'ID de la observación' })
  @ApiResponse({ status: 204, description: 'Observación eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Observación no encontrada.' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para eliminar esta observación.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarObservacion(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ): Promise<void> {
    await this.servicio_observaciones.eliminarObservacion(id, req.user.id_usuario);
  }
}