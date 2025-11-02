import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { GruposService } from './grupos.servicio';
import { CrearGrupoDto } from './dto/crear-grupo.dto';
import { ActualizarGrupoDto } from './dto/actualizar-grupo.dto';
import { AsignarEstudianteDto } from './dto/asignar-estudiante.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';
import { AutenticacionService } from '../autenticacion/autenticacion.servicio';

@ApiTags('grupos')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('grupos')
export class GruposController {
  constructor(
    private readonly servicio_grupos: GruposService,
    private readonly servicio_autenticacion: AutenticacionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo grupo' })
  @ApiResponse({ status: 201, description: 'Grupo creado exitosamente.' })
  crear(@Body() crear_grupo_dto: CrearGrupoDto) {
    return this.servicio_grupos.crear(crear_grupo_dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los grupos' })
  @ApiResponse({ status: 200, description: 'Lista de todos los grupos.' })
  obtenerTodos() {
    return this.servicio_grupos.obtenerTodos();
  }

  @Get('disponibles')
  @ApiOperation({ summary: 'Obtener grupos disponibles para inscripción' })
  @ApiResponse({ status: 200, description: 'Lista de grupos disponibles.' })
  obtenerDisponibles() {
    return this.servicio_grupos.obtenerGruposDisponibles();
  }

  @Get('mi-grupo')
  @ApiOperation({ summary: 'Obtener el grupo del estudiante autenticado' })
  @ApiResponse({ status: 200, description: 'Grupo del estudiante.' })
  @ApiResponse({ status: 404, description: 'El estudiante no tiene grupo asignado.' })
  obtenerMiGrupo(@Request() req) {
    return this.servicio_grupos.obtenerGrupoDelEstudiante(req.user.id_usuario);
  }

  @Get('periodo/:periodoId')
  @ApiOperation({ summary: 'Obtener grupos por período' })
  @ApiParam({ name: 'periodoId', description: 'ID del período' })
  @ApiResponse({ status: 200, description: 'Lista de grupos del período.' })
  obtenerPorPeriodo(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.servicio_grupos.obtenerPorPeriodo(periodoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un grupo por su ID' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({ status: 200, description: 'Grupo encontrado.' })
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicio_grupos.obtenerUno(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un grupo' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({ status: 200, description: 'Grupo actualizado.' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizar_grupo_dto: ActualizarGrupoDto) {
    return this.servicio_grupos.actualizar(id, actualizar_grupo_dto);
  }

  @Post(':id/asignar-estudiante')
  @ApiOperation({ summary: 'Asignar un estudiante a un grupo' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({ status: 200, description: 'Estudiante asignado exitosamente.' })
  asignarEstudiante(@Param('id', ParseIntPipe) id: number, @Body() dto: AsignarEstudianteDto) {
    return this.servicio_grupos.asignarEstudiante(id, dto.id_estudiante);
  }

  @Post(':id/inscribirse')
  @ApiOperation({ summary: 'Inscribirse a un grupo (auto-asignación)' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({ status: 200, description: 'Inscripción exitosa.' })
  @ApiResponse({ status: 400, description: 'No se puede inscribir (grupo lleno, ya inscrito, etc.).' })
  async inscribirseAGrupo(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const resultado = await this.servicio_grupos.inscribirEstudiante(id, req.user.id_usuario);
    const usuario_actualizado = await this.servicio_autenticacion.obtenerDatosUsuarioCompletos(req.user.id_usuario);
    
    return {
      ...resultado,
      usuario_actualizado
    };
  }

  @Delete(':id/remover-estudiante/:estudianteId')
  @ApiOperation({ summary: 'Remover un estudiante de un grupo' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiParam({ name: 'estudianteId', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Estudiante removido exitosamente.' })
  removerEstudiante(@Param('id', ParseIntPipe) id: number, @Param('estudianteId', ParseIntPipe) estudianteId: number) {
    return this.servicio_grupos.removerEstudiante(id, estudianteId);
  }

  @Delete(':id/desinscribirse')
  @ApiOperation({ summary: 'Desinscribirse de un grupo' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({ status: 200, description: 'Desinscripción exitosa.' })
  async desinscribirseDeGrupo(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const resultado = await this.servicio_grupos.desinscribirEstudiante(id, req.user.id_usuario);
    const usuario_actualizado = await this.servicio_autenticacion.obtenerDatosUsuarioCompletos(req.user.id_usuario);
    
    return {
      ...resultado,
      usuario_actualizado
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un grupo' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({ status: 200, description: 'Grupo eliminado.' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio_grupos.eliminar(id);
  }
}