// src/modulos/asesores/asesores.controlador.ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AsesoresService } from './asesores.servicio';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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

  // ✅ NUEVO ENDPOINT: Obtener estudiantes de mi grupo
  @Get('mi-grupo/estudiantes')
  @ApiOperation({ summary: 'Obtener estudiantes asignados al grupo del asesor' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de grupos con sus estudiantes',
    schema: {
      example: {
        grupos: [
          {
            id: 1,
            nombre: "Grupo A",
            estudiantes: [
              {
                id: 1,
                nombre: "Juan",
                apellido: "Pérez",
                correo: "juan@example.com",
                proyecto: "Tesis de Sistemas"
              }
            ]
          }
        ]
      }
    }
  })
  async obtenerEstudiantesDeMiGrupo(@Request() req) {
    return this.asesoresService.obtenerEstudiantesDeMiGrupo(req.user.id_usuario);
  }
}