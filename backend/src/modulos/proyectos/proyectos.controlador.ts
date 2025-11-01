import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards, Request, Query } from '@nestjs/common';
import { ProyectosService } from './proyectos.servicio';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';

import { AprobarEtapaDto } from './dto/aprobar-etapa.dto';
import { AccionTemaDto } from './dto/accion-tema.dto';
import { BuscarProyectosDto } from './dto/buscar-proyectos.dto';
import { ApiQuery } from '@nestjs/swagger'; // ← Agrega este
import { EtapaProyecto } from './enums/etapa-proyecto.enum'; // ← Agrega este
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

  @Patch(':id/aprobar-etapa')
  @ApiOperation({ summary: 'Aprobar una etapa del proyecto' })
  @ApiParam({ name: 'id', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Etapa aprobada exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo el asesor puede aprobar etapas' })
  @ApiResponse({ status: 400, description: 'Transición de etapa inválida' })
  
  async aprobarEtapa(
    @Param('id', ParseIntPipe) id: number,
    @Body() aprobarEtapaDto: AprobarEtapaDto,
    @Request() req
  ) {
    return this.servicio_proyectos.aprobarEtapa(id, aprobarEtapaDto, req.user.id_usuario);
  }

  @Patch(':id/tema')
  @ApiOperation({ summary: 'Aprobar o rechazar el tema propuesto de un proyecto' })
  @ApiParam({ name: 'id', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Tema gestionado exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo el asesor puede gestionar el tema' })
  @ApiResponse({ status: 400, description: 'El tema ya fue aprobado' })
  async gestionarTemaPropuesto(
    @Param('id', ParseIntPipe) id: number,
    @Body() accionTemaDto: AccionTemaDto,
    @Request() req
  ) {
    return this.servicio_proyectos.gestionarTemaPropuesto(id, accionTemaDto, req.user.id_usuario);
  }

  @Get('historial-progreso')
  @ApiOperation({ summary: 'Obtener historial de avances, revisiones y defensas del estudiante' })
  @ApiResponse({ status: 200, description: 'Historial de progreso del estudiante' })
  @ApiResponse({ status: 404, description: 'Estudiante sin proyecto asignado' })
  async obtenerHistorialProgreso(@Request() req) {
    return this.servicio_proyectos.obtenerHistorialProgreso(req.user.id_usuario);
  }

  @Get('cronograma')
  @ApiOperation({ summary: 'Obtener cronograma de fechas límite y revisiones del proyecto' })
  @ApiResponse({ status: 200, description: 'Cronograma del proyecto del estudiante' })
  @ApiResponse({ status: 404, description: 'Estudiante sin proyecto o período asignado' })
  async obtenerCronogramaProyecto(@Request() req) {
    return this.servicio_proyectos.obtenerCronogramaProyecto(req.user.id_usuario);
  }

  
  @Get('buscar')
  @ApiOperation({ summary: 'Buscar en el repositorio de proyectos de grado' })
  @ApiQuery({ name: 'termino', required: false, type: String })
  @ApiQuery({ name: 'periodoId', required: false, type: String })
  @ApiQuery({ name: 'etapa', required: false, enum: EtapaProyecto })
  @ApiQuery({ name: 'soloAprobados', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Resultados de la búsqueda' })
  async buscarProyectos(
    @Query() buscarDto: BuscarProyectosDto,
    @Request() req
  ) {
    return this.servicio_proyectos.buscarProyectos(buscarDto, req.user.id_usuario);
  }
}