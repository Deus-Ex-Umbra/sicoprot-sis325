import { Controller, Post, Get, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ReunionesService } from './reuniones.servicio';
import { CrearReunionDto } from './dto/crear-reuinion.dto';
import { ActualizarReunionDto } from './dto/actualizar-reunion.dto';
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

  @Post()
  @Roles(Rol.Asesor)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Programar una nueva reunión (Asesor)' })
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