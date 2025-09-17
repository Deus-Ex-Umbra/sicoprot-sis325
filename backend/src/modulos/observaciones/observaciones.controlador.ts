import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ObservacionesService } from './observaciones.servicio';
import { CrearObservacionDto } from './dto/crear-observacion.dto';

@Controller('observaciones')
export class ObservacionesController {
  constructor(private readonly observacionesService: ObservacionesService) {}

  @Post(':documentoId/crear')
  crear(
    @Param('documentoId', ParseUUIDPipe) documentoId: string,
    @Body() crearObservacionDto: CrearObservacionDto,
  ) {
    return this.observacionesService.crear(documentoId, crearObservacionDto);
  }

  @Get('por-documento/:documentoId')
  obtenerPorDocumento(@Param('documentoId', ParseUUIDPipe) documentoId: string) {
    return this.observacionesService.obtenerPorDocumento(documentoId);
  }
}