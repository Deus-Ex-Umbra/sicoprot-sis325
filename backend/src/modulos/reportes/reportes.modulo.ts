import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesControlador } from './reportes.controlador';
import { ReportesServicio } from './reportes.servicio';
import { Proyecto } from '../proyectos/entidades/proyecto.endidad';

@Module({
  imports: [TypeOrmModule.forFeature([Proyecto])],
  controllers: [ReportesControlador],
  providers: [ReportesServicio],
})
export class ReportesModule {}
