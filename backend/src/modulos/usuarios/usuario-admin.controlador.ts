// src/usuarios/controllers/usuario-admin.controller.ts
import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Roles } from '../autenticacion/decorators/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';
import  {UsuariosService} from '../usuarios/usuarios.servicio';

@UseGuards(JwtGuard, RolesGuard)
@Controller('api/admin/usuarios') // prefijo de ruta sugerido
export class UsuarioAdminController {
    constructor(private usuarioService: UsuariosService) {}

    @Get('tribunales')
    @Roles(Rol.Administrador)
    async listarTribunales() {
        return this.usuarioService.listarPorRol(Rol.Tribunal);
    }
}