import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards, Request } from '@nestjs/common';
import { ObservacionesService } from './observaciones.servicio';
import { CrearObservacionDto } from './dto/crear-observacion.dto';
import { ActualizarObservacionDto } from './dto/actualizar-observacion.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';

@ApiTags('observaciones')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('observaciones')
export class ObservacionesController {
  constructor(private readonly servicio_observaciones: ObservacionesService) {}

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
  
  @Get('por-estudiante')
  @ApiOperation({ summary: 'Obtener todas las observaciones de un estudiante' })
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
}