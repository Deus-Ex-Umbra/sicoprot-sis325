import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReunionesService } from './reuniones.servicio';
import { ReunionesController } from './reuniones.controlador';
import { Reunion } from './entidades/reunion.entidad';
import { ObservacionReunion } from './entidades/observacion-reunion.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Proyecto } from '../proyectos/entidades/proyecto.endidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reunion, ObservacionReunion, Asesor, Proyecto, Estudiante]),
  ],
  controllers: [ReunionesController],
  providers: [ReunionesService],
  exports: [TypeOrmModule, ReunionesService],
})
export class ReunionesModule {}