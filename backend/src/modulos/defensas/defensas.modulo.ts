import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefensasController } from './defensas.controlador';
import { DefensasService } from './defensas.servicio';
import { Defensa } from './entidades/defensa.entidad';
import { Tribunal } from './entidades/tribunal.entidad';
import { ProyectosModule } from '../proyectos/proyectos.modulo';
import { AsesoresModule } from '../asesores/asesores.modulo';
import { Proyecto } from '../proyectos/entidades/proyecto.endidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([Defensa, Tribunal, Proyecto, Asesor]),
    ProyectosModule,
    AsesoresModule,
  ],
  controllers: [DefensasController],
  providers: [DefensasService],
  exports: [DefensasService],
})
export class DefensasModule {}
