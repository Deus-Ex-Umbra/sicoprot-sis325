import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards, Request, Query } from '@nestjs/common';
import { ProyectosService } from './proyectos.servicio';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';
import { AprobarEtapaDto } from './dto/aprobar-etapa.dto';
import { AccionTemaDto } from './dto/accion-tema.dto';
import { BuscarProyectosDto } from './dto/buscar-proyectos.dto';
import { EtapaProyecto } from './enums/etapa-proyecto.enum';
import { SolicitarDefensaDto } from './dto/solicitar-defensa.dto';
import { ResponderSolicitudDefensaDto } from './dto/responder-solicitud-defensa.dto';
import { Rol } from '../usuarios/enums/rol.enum';
import { Roles } from '../autenticacion/decorators/roles.decorator';
import { RolesGuard } from '../autenticacion/guards/roles.guard';

@ApiTags('proyectos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly servicio_proyectos: ProyectosService) {}

  @Post()
  @Roles(Rol.Estudiante)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Crear un nuevo proyecto (Taller I)' })
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

  @Get('buscar')
  @ApiOperation({ summary: 'Buscar en el repositorio de proyectos de grado' })
  @ApiQuery({ name: 'termino', required: false, type: String })
  @ApiQuery({ name: 'periodoId', required: false, type: String })
  @ApiQuery({ name: 'etapa', required: false, enum: EtapaProyecto })
  @ApiQuery({ name: 'soloAprobados', required: false, type: Boolean, description: 'Filtra por proyectos con etapa TERMINADO' })
  @ApiQuery({ name: 'anio', required: false, type: String })
  @ApiQuery({ name: 'carrera', required: false, type: String })
  @ApiQuery({ name: 'asesorId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Resultados de la búsqueda' })
  async buscarProyectos(
    @Query() buscarDto: BuscarProyectosDto,
    @Request() req
  ) {
    return this.servicio_proyectos.buscarProyectos(buscarDto, req.user.id_usuario, req.user.rol);
  }

  @Get('historial-progreso')
  @Roles(Rol.Estudiante)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Obtener historial de avances y revisiones (Estudiante)' })
  @ApiResponse({ status: 200, description: 'Historial de progreso del estudiante' })
  @ApiResponse({ status: 404, description: 'Estudiante sin proyecto asignado' })
  async obtenerHistorialProgreso(@Request() req) {
    return this.servicio_proyectos.obtenerHistorialProgreso(req.user.id_usuario);
  }

  @Get('cronograma')
  @Roles(Rol.Estudiante)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Obtener cronograma de fechas límite (Estudiante)' })
  @ApiResponse({ status: 200, description: 'Cronograma del proyecto del estudiante' })
  @ApiResponse({ status: 404, description: 'Estudiante sin proyecto o período asignado' })
  async obtenerCronogramaProyecto(@Request() req) {
    return this.servicio_proyectos.obtenerCronogramaProyecto(req.user.id_usuario);
  }

  @Get('timeline')
  @Roles(Rol.Estudiante)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Obtener línea de tiempo completa del proyecto (Estudiante)' })
  @ApiResponse({ status: 200, description: 'Línea de tiempo completa.' })
  async obtenerTimelineCompleto(@Request() req) {
    return this.servicio_proyectos.obtenerTimelineCompleto(req.user.id_usuario);
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
  @Roles(Rol.Asesor)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Aprobar una etapa del proyecto (Asesor)' })
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
  @Roles(Rol.Asesor)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Aprobar o rechazar el tema propuesto (Asesor)' })
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

  @Patch(':id/solicitar-defensa')
  @Roles(Rol.Estudiante)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Solicitar defensa de proyecto (Estudiante)' })
  @ApiParam({ name: 'id', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Solicitud de defensa enviada.' })
  async solicitarDefensa(
    @Param('id', ParseIntPipe) id: number,
    @Body() solicitarDefensaDto: SolicitarDefensaDto,
    @Request() req,
  ) {
    return this.servicio_proyectos.solicitarDefensa(id, solicitarDefensaDto, req.user.id_usuario);
  }
  
  @Patch(':id/responder-defensa')
  @Roles(Rol.Administrador)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Responder solicitud de defensa (Admin)' })
  @ApiParam({ name: 'id', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Respuesta a solicitud registrada.' })
  async responderSolicitudDefensa(
    @Param('id', ParseIntPipe) id: number,
    @Body() responderDto: ResponderSolicitudDefensaDto,
    @Request() req,
  ) {
    return this.servicio_proyectos.responderSolicitudDefensa(id, responderDto, req.user.id_usuario);
  }
}