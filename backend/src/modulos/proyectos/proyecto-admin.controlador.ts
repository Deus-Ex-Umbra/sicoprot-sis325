import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Roles } from '../autenticacion/decorators/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';
import { ProyectosService } from './proyectos.servicio';
import { AsignarTribunalDto } from './dto/asignar-tribunal.dto';

@UseGuards(JwtGuard, RolesGuard)
@Controller('api/proyectos') // o el prefijo que uses
export class ProyectoAdminController {
    constructor(private proyectoService: ProyectosService) {}

    @Patch(':id/tribunales')
    @Roles(Rol.Administrador)
    async asignarTribunales(@Param('id') id: string, @Body() dto: AsignarTribunalDto) {
        return this.proyectoService.actualizarTribunales(+id, dto.tribunalIds);
    }
}