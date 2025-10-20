import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SolicitudesRegistroService } from './solicitudes-registro.servicio';
import { CrearSolicitudDto } from './dto/crear-solicitud.dto';
import { ResponderSolicitudDto } from './dto/responder-solicitud.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('solicitudes-registro')
@Controller('solicitudes-registro')
export class SolicitudesRegistroController {
  constructor(private readonly servicio_solicitudes: SolicitudesRegistroService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva solicitud de registro' })
  @ApiResponse({ status: 201, description: 'Solicitud creada exitosamente.' })
  crear(@Body() crear_solicitud_dto: CrearSolicitudDto) {
    return this.servicio_solicitudes.crear(crear_solicitud_dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las solicitudes' })
  @ApiResponse({ status: 200, description: 'Lista de todas las solicitudes.' })
  obtenerTodas() {
    return this.servicio_solicitudes.obtenerTodas();
  }

  @Get('pendientes')
  @ApiOperation({ summary: 'Obtener solicitudes pendientes' })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes pendientes.' })
  obtenerPendientes() {
    return this.servicio_solicitudes.obtenerPendientes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una solicitud por ID' })
  @ApiParam({ name: 'id', description: 'ID de la solicitud' })
  @ApiResponse({ status: 200, description: 'Solicitud encontrada.' })
  obtenerUna(@Param('id', ParseIntPipe) id: number) {
    return this.servicio_solicitudes.obtenerUna(id);
  }

  @Patch(':id/responder')
  @ApiOperation({ summary: 'Aprobar o rechazar una solicitud' })
  @ApiParam({ name: 'id', description: 'ID de la solicitud' })
  @ApiResponse({ status: 200, description: 'Solicitud procesada.' })
  responder(@Param('id', ParseIntPipe) id: number, @Body() responder_solicitud_dto: ResponderSolicitudDto) {
    return this.servicio_solicitudes.responder(id, responder_solicitud_dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una solicitud' })
  @ApiParam({ name: 'id', description: 'ID de la solicitud' })
  @ApiResponse({ status: 200, description: 'Solicitud eliminada.' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio_solicitudes.eliminar(id);
  }
}