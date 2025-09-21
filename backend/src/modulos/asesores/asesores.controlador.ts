import { Controller, Get, UseGuards } from '@nestjs/common';
import { AsesoresService } from './asesores.servicio';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';

@ApiTags('asesores')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('asesores')
export class AsesoresController {
  constructor(private readonly asesoresService: AsesoresService) {}

  @Get()
  findAll() {
    return this.asesoresService.findAll();
  }
}