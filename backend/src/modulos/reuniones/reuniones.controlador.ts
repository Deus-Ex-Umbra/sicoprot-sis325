import { Controller, Post, Get, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ReunionesService } from './reuniones.servicio';
import { CrearReunionDto } from './dto/crear-reuinion.dto';
import { ProponerReunionDto } from './dto/proponer-reunion.dto';
import { AgendarReunionDto } from './dto/agendar-reunion.dto';
import { ActualizarReunionDto } from './dto/actualizar-reunion.dto';
import { CrearObservacionReunionDto } from './dto/crear-observacion-reunion.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';
import { Roles } from '../autenticacion/decorators/roles.decorator';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Rol } from '../usuarios/enums/rol.enum';

@ApiTags('reuniones')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@Controller('reuniones')
export class ReunionesController {
  constructor(private readonly servicio_reuniones: ReunionesService) {}

  @Post('proponer')
  @Roles(Rol.Asesor)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Proponer una nueva reunión (Asesor)' })
  proponerReunion(@Body() dto: ProponerReunionDto, @Request() req) {
    return this.servicio_reuniones.proponerReunion(dto, req.user.id_usuario);
  }

  @Patch(':id/agendar')
  @Roles(Rol.Estudiante)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Agendar fecha de reunión (Estudiante)' })
  agendarReunion(@Param('id', ParseIntPipe) id: number, @Body() dto: AgendarReunionDto, @Request() req) {
    return this.servicio_reuniones.agendarReunion(id, dto, req.user.id_usuario);
  }

  @Patch(':id/confirmar')
  @Roles(Rol.Asesor)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Confirmar reunión agendada (Asesor)' })
  confirmarReunion(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.servicio_reuniones.confirmarReunion(id, req.user.id_usuario);
  }

  @Post('observaciones')
  @Roles(Rol.Asesor)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Crear observación de reunión' })
  crearObservacion(@Body() dto: CrearObservacionReunionDto, @Request() req) {
    return this.servicio_reuniones.crearObservacion(dto, req.user.id_usuario);
  }

  @Patch('observaciones/:id/corregir')
  @Roles(Rol.Asesor)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Marcar observación como corregida' })
  marcarObservacionCorregida(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.servicio_reuniones.marcarObservacionCorregida(id, req.user.id_usuario);
  }

  @Get('proyecto/:id/observaciones-pendientes')
  @ApiOperation({ summary: 'Obtener observaciones pendientes de reuniones de un proyecto' })
  obtenerObservacionesPendientes(@Param('id', ParseIntPipe) id: number) {
    return this.servicio_reuniones.obtenerObservacionesPendientes(id);
  }

  @Post()
  @Roles(Rol.Asesor)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Programar una nueva reunión (Directa - Legacy)' })
  crearReunion(@Body() crearDto: CrearReunionDto, @Request() req) {
    return this.servicio_reuniones.crearReunion(crearDto, req.user.id_usuario);
  }

  @Get('proyecto/:id')
  @ApiOperation({ summary: 'Obtener reuniones de un proyecto' })
  obtenerPorProyecto(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.servicio_reuniones.obtenerPorProyecto(id, req.user.id_usuario, req.user.rol);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reunión por ID' })
  obtenerUna(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.servicio_reuniones.obtenerUna(id, req.user.id_usuario, req.user.rol);
  }

  @Patch(':id')
  @Roles(Rol.Asesor)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Actualizar una reunión (Asesor)' })
  actualizarReunion(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarDto: ActualizarReunionDto,
    @Request() req,
  ) {
    return this.servicio_reuniones.actualizarReunion(id, actualizarDto, req.user.id_usuario);
  }

  @Delete(':id')
  @Roles(Rol.Asesor)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Cancelar/Eliminar una reunión (Asesor)' })
  eliminarReunion(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.servicio_reuniones.eliminarReunion(id, req.user.id_usuario);
  }
}