import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropuestasTemaService } from './propuestas-tema.servicio';
import { PropuestasTemaController } from './propuestas-tema.controlador';
import { PropuestaTema } from './entidades/propuesta-tema.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Proyecto } from '../proyectos/entidades/proyecto.endidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropuestaTema, Estudiante, Proyecto, Asesor]),
  ],
  controllers: [PropuestasTemaController],
  providers: [PropuestasTemaService],
  exports: [TypeOrmModule, PropuestasTemaService],
})
export class PropuestasTemaModule {}