import { Controller, Post, Get, Body, Req, UseGuards, Param } from '@nestjs/common';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { Roles } from '../autenticacion/decorators/roles.decorator';
import { Rol } from '../usuarios/enums/rol.enum';
import { EvaluacionTribunalService } from './evaluacion.servicio'; // 👈 nombre coherente
import { CrearEvaluacionDto } from './dto/crear-evaluacion.dto';

@Controller('api/tribunal')
@UseGuards(JwtGuard, RolesGuard)
export class EvaluacionTribunalController {
    constructor(private evaluacionTribunalService: EvaluacionTribunalService) {}

    @Post('proyectos/:id/evaluar')
    @Roles(Rol.Tribunal)
    crearEvaluacion(@Req() req, @Body() dto: CrearEvaluacionDto, @Param('id') proyectoId: number) {
        const tribunalId = req.user.id;
        return this.evaluacionTribunalService.crearEvaluacion(tribunalId, proyectoId, dto);
    }

    @Get('proyectos')
    @Roles(Rol.Tribunal)
    async misProyectos(@Req() req) {
        return this.evaluacionTribunalService.listarProyectosDeTribunal(req.user.id);
    }
}