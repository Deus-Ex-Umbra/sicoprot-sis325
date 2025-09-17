import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProyectosService } from './proyectos.servicio';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';

@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}

  @Post()
  crear(@Body() crearProyectoDto: CrearProyectoDto) {
    return this.proyectosService.crear(crearProyectoDto);
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.proyectosService.obtenerUno(id);
  }
}