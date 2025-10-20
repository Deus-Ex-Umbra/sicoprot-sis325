import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ProyectosService } from './proyectos.servicio';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';

@ApiTags('proyectos')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly servicio_proyectos: ProyectosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo proyecto' })
  @ApiResponse({ status: 201, description: 'Proyecto creado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Estudiante o Asesor no encontrado.' })
  crear(@Body() crear_proyecto_dto: CrearProyectoDto, @Request() req) {
    return this.servicio_proyectos.crear(crear_proyecto_dto, req.user.id_usuario);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los proyectos del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de proyectos del usuario.' })
  obtenerTodos(@Request() req) {
    return this.servicio_proyectos.obtenerTodos(req.user.id_usuario, req.user.rol);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un proyecto por su ID' })
  @ApiParam({ name: 'id', description: 'ID numérico del proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto encontrado.' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado.' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para acceder a este proyecto.' })
  obtenerUno(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.servicio_proyectos.obtenerUno(id, req.user.id_usuario, req.user.rol);
  }
}