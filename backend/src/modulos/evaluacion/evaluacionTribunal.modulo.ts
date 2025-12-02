import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluacionTribunal } from './entidades/evaluacion-tribunal.entity';
import { Proyecto } from '../proyectos/entidades/proyecto.endidad';
import { EvaluacionTribunalService } from './evaluacion.servicio';
import { EvaluacionTribunalController } from './evaluacion.controlador';

@Module({
    imports: [
        TypeOrmModule.forFeature([EvaluacionTribunal, Proyecto]),
    ],
    providers: [EvaluacionTribunalService],
    controllers: [EvaluacionTribunalController],
})
export class EvaluacionTribunalModule {}