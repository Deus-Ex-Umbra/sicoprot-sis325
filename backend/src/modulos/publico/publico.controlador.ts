import { Controller, Get, Query } from '@nestjs/common';
import { ProyectosService } from '../proyectos/proyectos.servicio';

@Controller('api/public')
export class PublicoController {
    constructor(private readonly proyectoService: ProyectosService) {}

    // Endpoint para buscar proyectos
    @Get('proyectos/buscar')
    async buscarProyectos(@Query('q') q: string) {
        if (!q || q.trim().length === 0) {
        return [];
        }
        return this.proyectoService.buscarPublico(q);
    }

    // Endpoint para obtener los últimos proyectos aprobados
    @Get('proyectos/ultimos')
    async obtenerUltimosProyectos() {
        return this.proyectoService.obtenerUltimosAprobados();
    }
}