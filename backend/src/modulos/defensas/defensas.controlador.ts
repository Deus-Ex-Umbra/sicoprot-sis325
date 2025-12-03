import { Controller, Post, Get, Patch, Body, Param, Query, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { DefensasService } from './defensas.servicio';
import { ProgramarDefensaDto } from './dto/programar-defensa.dto';
import { CalificarDefensaDto } from './dto/calificar-defensa.dto';
import { FinalizarDefensaDto } from './dto/finalizar-defensa.dto';
import { TipoDefensa } from './entidades/defensa.entidad';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';
import { Roles } from '../autenticacion/decorators/roles.decorator';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Rol } from '../usuarios/enums/rol.enum';

@ApiTags('defensas')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('defensas')
export class DefensasController {
  constructor(private readonly servicio_defensas: DefensasService) {}

  @Post('programar')
  @Roles(Rol.Administrador)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Programar una pre-defensa o defensa' })
  programarDefensa(@Body() dto: ProgramarDefensaDto) {
    return this.servicio_defensas.programarDefensa(dto);
  }

  @Get('mis-asignaciones')
  @Roles(Rol.Asesor)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Obtener defensas asignadas como tribunal' })
  obtenerMisAsignaciones(@Request() req) {
    return this.servicio_defensas.obtenerDefensasPorTribunal(req.user.id_usuario);
  }

  @Get('solicitudes-pendientes')
  @Roles(Rol.Administrador)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Obtener proyectos con solicitud de defensa pendiente' })
  obtenerSolicitudesPendientes() {
    return this.servicio_defensas.obtenerSolicitudesPendientes();
  }

  @Get('programadas')
  @Roles(Rol.Administrador)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Obtener defensas programadas o en curso' })
  obtenerDefensasProgramadas(@Query('tipo') tipo?: TipoDefensa) {
    return this.servicio_defensas.obtenerDefensasProgramadas(tipo);
  }

  @Get('todas-pre-defensas')
  @Roles(Rol.Administrador)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Obtener todas las pre-defensas (todos los estados)' })
  obtenerTodasPreDefensas() {
    return this.servicio_defensas.obtenerTodasPorTipo(TipoDefensa.PRE_DEFENSA);
  }

  @Get('todas-defensas')
  @Roles(Rol.Administrador)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Obtener todas las defensas finales (todos los estados)' })
  obtenerTodasDefensas() {
    return this.servicio_defensas.obtenerTodasPorTipo(TipoDefensa.DEFENSA);
  }

  @Get('finalizadas')
  @Roles(Rol.Administrador)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Obtener defensas finalizadas' })
  obtenerDefensasFinalizadas(@Query('tipo') tipo?: TipoDefensa) {
    return this.servicio_defensas.obtenerDefensasFinalizadas(tipo);
  }

  @Get('proyecto/:id')
  @ApiOperation({ summary: 'Obtener todas las defensas de un proyecto' })
  obtenerDefensasPorProyecto(@Param('id', ParseIntPipe) id: number) {
    return this.servicio_defensas.obtenerDefensasPorProyecto(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una defensa' })
  obtenerDefensaDetalle(@Param('id', ParseIntPipe) id: number) {
    return this.servicio_defensas.obtenerDefensaDetalle(id);
  }

  @Post('validar-tribunal')
  @Roles(Rol.Administrador)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Validar que los asesores seleccionados puedan ser tribunal' })
  validarTribunal(@Body() body: { id_proyecto: number; ids_asesores: number[] }) {
    return this.servicio_defensas.validarTribunalParaProyecto(body.id_proyecto, body.ids_asesores);
  }

  @Patch(':id/confirmar-asistencia')
  @Roles(Rol.Asesor)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Confirmar asistencia a una defensa' })
  confirmarAsistencia(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.servicio_defensas.confirmarAsistencia(id, req.user.id_usuario);
  }

  @Patch(':id/calificar')
  @Roles(Rol.Asesor)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Calificar y observar una defensa' })
  calificarDefensa(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CalificarDefensaDto,
    @Request() req,
  ) {
    return this.servicio_defensas.calificarDefensa(id, req.user.id_usuario, dto);
  }

  @Patch(':id/comentarios-correccion')
  @Roles(Rol.Asesor)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Agregar comentarios de corrección para predefensa' })
  agregarComentariosCorreccion(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { comentarios: string },
    @Request() req,
  ) {
    return this.servicio_defensas.agregarComentariosCorreccion(id, req.user.id_usuario, body.comentarios);
  }

  @Patch(':id/iniciar')
  @Roles(Rol.Administrador)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Iniciar una defensa (cambiar estado a EN_CURSO)' })
  iniciarDefensa(@Param('id', ParseIntPipe) id: number) {
    return this.servicio_defensas.iniciarDefensa(id);
  }

  @Patch(':id/finalizar')
  @Roles(Rol.Administrador)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Finalizar una defensa y calcular resultado' })
  finalizarDefensa(@Param('id', ParseIntPipe) id: number, @Body() dto: FinalizarDefensaDto) {
    return this.servicio_defensas.finalizarDefensa(id, dto);
  }

  @Post('rehabilitar/:id_proyecto')
  @Roles(Rol.Administrador)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Rehabilitar proyecto para nueva defensa' })
  rehabilitarDefensa(@Param('id_proyecto', ParseIntPipe) id_proyecto: number) {
    return this.servicio_defensas.rehabilitarDefensa(id_proyecto);
  }

  @Post('reprogramar/:id_proyecto')
  @Roles(Rol.Administrador)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Reprogramar defensa para proyecto reprobado' })
  reprogramarDefensa(
    @Param('id_proyecto', ParseIntPipe) id_proyecto: number,
    @Body() dto: ProgramarDefensaDto,
  ) {
    return this.servicio_defensas.reprogramarDefensa(id_proyecto, dto);
  }

  @Get('para-reprogramar')
  @Roles(Rol.Administrador)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Obtener proyectos que pueden ser reprogramados' })
  obtenerProyectosParaReprogramar() {
    return this.servicio_defensas.obtenerProyectosParaReprogramar();
  }

  @Patch(':id/asignar-fecha')
  @Roles(Rol.Administrador)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Asignar fecha y tribunal a una defensa sin programar' })
  asignarFechaDefensa(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProgramarDefensaDto,
  ) {
    return this.servicio_defensas.asignarFechaDefensa(id, dto);
  }

  @Get('observaciones-estudiante/:id_proyecto')
  @ApiOperation({ summary: 'Obtener observaciones de pre-defensa para estudiante' })
  obtenerObservacionesPreDefensa(@Param('id_proyecto', ParseIntPipe) id_proyecto: number) {
    return this.servicio_defensas.obtenerObservacionesPreDefensaParaEstudiante(id_proyecto);
  }
}
