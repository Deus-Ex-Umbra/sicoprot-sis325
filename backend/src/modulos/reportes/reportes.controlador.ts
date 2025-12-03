import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportesServicio } from './reportes.servicio';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Roles } from '../autenticacion/decorators/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';

@Controller('reportes')
@UseGuards(JwtGuard, RolesGuard)
export class ReportesControlador {
  constructor(private readonly reportesServicio: ReportesServicio) {}

  @Get('avances')
  @Roles(Rol.Administrador)
  async obtenerAvanceGrupos() {
    return this.reportesServicio.obtenerAvanceGrupos();
  }

  @Get('tiempos-revision')
  @Roles(Rol.Administrador)
  async obtenerTiemposRevision() {
    return this.reportesServicio.obtenerTiemposRevision();
  }
}
