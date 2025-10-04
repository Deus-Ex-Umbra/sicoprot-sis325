import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { CorreccionesService } from './correcciones.servicio';
import { CrearCorreccionDto } from './dto/crear-correccion.dto';
import { ActualizarCorreccionDto } from './dto/actualizar-correccion.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';

@ApiTags('correcciones')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('correcciones')
export class CorreccionesController {
  constructor(private readonly servicio_correcciones: CorreccionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva corrección' })
  @ApiResponse({ status: 201, description: 'Corrección creada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Observación o documento no encontrado.' })
  @ApiResponse({ status: 403, description: 'Solo los estudiantes pueden crear correcciones.' })
  crear(@Body() crear_correccion_dto: CrearCorreccionDto, @Request() req) {
    return this.servicio_correcciones.crear(crear_correccion_dto, req.user.id_usuario);
  }

  @Get('por-documento/:documentoId')
  @ApiOperation({ summary: 'Obtener todas las correcciones de un documento' })
  @ApiParam({ name: 'documentoId', description: 'ID numérico del documento' })
  @ApiResponse({ status: 200, description: 'Lista de correcciones del documento.' })
  obtenerPorDocumento(@Param('documentoId', ParseIntPipe) documentoId: number) {
    return this.servicio_correcciones.obtenerPorDocumento(documentoId);
  }

  @Get('por-proyecto/:proyectoId')
  @ApiOperation({ summary: 'Obtener todas las correcciones de un proyecto' })
  @ApiParam({ name: 'proyectoId', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Lista de correcciones del proyecto.' })
  obtenerPorProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
    return this.servicio_correcciones.obtenerPorProyecto(proyectoId);
  }

  @Get('por-estudiante')
  @ApiOperation({ summary: 'Obtener todas las correcciones de un estudiante' })
  @ApiResponse({ status: 200, description: 'Lista de correcciones del estudiante.' })
  obtenerPorEstudiante(@Request() req) {
    return this.servicio_correcciones.obtenerPorEstudiante(req.user.id_usuario);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una corrección' })
  @ApiParam({ name: 'id', description: 'ID de la corrección a actualizar' })
  @ApiResponse({ status: 200, description: 'Corrección actualizada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Corrección no encontrada.' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para actualizar esta corrección.' })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizar_correccion_dto: ActualizarCorreccionDto,
    @Request() req
  ) {
    return this.servicio_correcciones.actualizar(id, actualizar_correccion_dto, req.user.id_usuario);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una corrección' })
  @ApiParam({ name: 'id', description: 'ID de la corrección a eliminar' })
  @ApiResponse({ status: 200, description: 'Corrección eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Corrección no encontrada.' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para eliminar esta corrección.' })
  eliminar(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.servicio_correcciones.eliminar(id, req.user.id_usuario);
  }
}