import { Controller, Get, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AdministracionService } from './administracion.servicio';
import { CambiarEstadoUsuarioDto } from './dto/cambiar-estado-usuario.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';

@ApiTags('administracion')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('administracion')
export class AdministracionController {
  constructor(private readonly servicio_administracion: AdministracionService) {}

  @Get('usuarios')
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios.' })
  obtenerTodosUsuarios() {
    return this.servicio_administracion.obtenerTodosUsuarios();
  }

  @Get('estudiantes')
  @ApiOperation({ summary: 'Obtener todos los estudiantes' })
  @ApiResponse({ status: 200, description: 'Lista de estudiantes.' })
  obtenerEstudiantes() {
    return this.servicio_administracion.obtenerEstudiantes();
  }

  @Get('estudiantes/sin-grupo')
  @ApiOperation({ summary: 'Obtener estudiantes sin grupo' })
  @ApiResponse({ status: 200, description: 'Lista de estudiantes sin grupo.' })
  obtenerEstudiantesSinGrupo() {
    return this.servicio_administracion.obtenerEstudiantesSinGrupo();
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas generales' })
  @ApiResponse({ status: 200, description: 'Estadísticas del sistema.' })
  obtenerEstadisticas() {
    return this.servicio_administracion.obtenerEstadisticas();
  }

  @Patch('usuarios/:id/cambiar-estado')
  @ApiOperation({ summary: 'Cambiar el estado de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Estado cambiado exitosamente.' })
  cambiarEstadoUsuario(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarEstadoUsuarioDto) {
    return this.servicio_administracion.cambiarEstadoUsuario(id, dto.estado);
  }
}