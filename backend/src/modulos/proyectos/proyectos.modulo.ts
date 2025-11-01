import { Module } from '@nestjs/common';
import { ProyectosService } from './proyectos.servicio';
import { ProyectosController } from './proyectos.controlador';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from './entidades/proyecto.endidad';
import { EstudiantesModule } from '../estudiantes/estudiantes.modulo';
import { AsesoresModule } from '../asesores/asesores.modulo';


import { EtapaProyecto } from './enums/etapa-proyecto.enum';
@Module({
  imports: [
    TypeOrmModule.forFeature([Proyecto]),
    EstudiantesModule,
    AsesoresModule,
  ],
  controllers: [ProyectosController],
  providers: [ProyectosService],
  exports: [TypeOrmModule],
})
export class ProyectosModule {}