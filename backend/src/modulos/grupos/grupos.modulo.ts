import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from './entidades/grupo.entidad';
import { GruposController } from './grupos.controlador';
import { GruposService } from './grupos.servicio';
import { AsesoresModule } from '../asesores/asesores.modulo';
import { PeriodosModule } from '../periodos/periodos.modulo';
import { EstudiantesModule } from '../estudiantes/estudiantes.modulo';
import { AutenticacionModule } from '../autenticacion/autenticacion.modulo';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grupo]),
    AsesoresModule,
    PeriodosModule,
    EstudiantesModule,
    AutenticacionModule,
  ],
  controllers: [GruposController],
  providers: [GruposService],
  exports: [TypeOrmModule, GruposService],
})
export class GruposModule {}