import { Controller, Post, Get, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { PropuestasTemaService } from './propuestas-tema.servicio';
import { CrearPropuestaTemaDto } from './dto/crear-propuesta-tema.dto';
import { ResponderPropuestaDto } from './dto/responder-propuesta.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';
import { Roles } from '../autenticacion/decorators/roles.decorator';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Rol } from '../usuarios/enums/rol.enum';

@ApiTags('propuestas-tema')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@Controller('propuestas-tema')
export class PropuestasTemaController {
  constructor(private readonly servicio_propuestas: PropuestasTemaService) {}

  @Post()
  @Roles(Rol.Estudiante)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Crear una nueva propuesta de tema (Estudiante)' })
  crear(@Body() crearDto: CrearPropuestaTemaDto, @Request() req) {
    return this.servicio_propuestas.crear(crearDto, req.user.id_usuario);
  }

  @Get('proyecto/:id')
  @ApiOperation({ summary: 'Obtener todas las propuestas de un proyecto' })
  obtenerPorProyecto(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.servicio_propuestas.obtenerPorProyecto(id, req.user.id_usuario, req.user.rol);
  }

  @Patch(':id/responder')
  @Roles(Rol.Asesor)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Aprobar o rechazar una propuesta (Asesor)' })
  responderPropuesta(
    @Param('id', ParseIntPipe) id: number,
    @Body() responderDto: ResponderPropuestaDto,
    @Request() req,
  ) {
    return this.servicio_propuestas.responderPropuesta(id, responderDto, req.user.id_usuario);
  }

  @Delete(':id')
  @Roles(Rol.Estudiante)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Eliminar una propuesta pendiente (Estudiante)' })
  eliminarPropuesta(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.servicio_propuestas.eliminarPropuesta(id, req.user.id_usuario);
  }
}