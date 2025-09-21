import { Controller, Post, Get, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { CorreccionesService } from './correcciones.servicio';
import { CrearCorreccionDto } from './dto/crear-correccion.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';

@ApiTags('correcciones')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('correcciones')
export class CorreccionesController {
  constructor(private readonly servicio_correcciones: CorreccionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una corrección para una observación' })
  @ApiResponse({ status: 201, description: 'Corrección creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'La observación ya tiene una corrección asignada.' })
  @ApiResponse({ status: 404, description: 'Observación o documento no encontrado.' })
  crear(@Body() crear_correccion_dto: CrearCorreccionDto, @Request() req) {
    return this.servicio_correcciones.crear(crear_correccion_dto, req.user.id_usuario);
  }

  @Get('por-documento/:documentoId')
  @ApiOperation({ summary: 'Obtener todas las correcciones de un documento' })
  @ApiParam({ name: 'documentoId', description: 'ID del documento' })
  @ApiResponse({ status: 200, description: 'Lista de correcciones del documento.' })
  obtenerPorDocumento(@Param('documentoId', ParseIntPipe) documentoId: number) {
    return this.servicio_correcciones.obtenerPorDocumento(documentoId);
  }

  @Get('por-observacion/:observacionId')
  @ApiOperation({ summary: 'Obtener la corrección de una observación específica' })
  @ApiParam({ name: 'observacionId', description: 'ID de la observación' })
  @ApiResponse({ status: 200, description: 'Corrección de la observación.' })
  obtenerPorObservacion(@Param('observacionId', ParseIntPipe) observacionId: number) {
    return this.servicio_correcciones.obtenerPorObservacion(observacionId);
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