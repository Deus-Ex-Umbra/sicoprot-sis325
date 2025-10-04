import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorreccionesController } from './correcciones.controlador';
import { CorreccionesService } from './correcciones.servicio';
import { Correccion } from './entidades/correccion.entidad';
import { Observacion } from '../observaciones/entidades/observacion.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Documento } from '../documentos/entidades/documento.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([Correccion, Observacion, Estudiante, Documento])],
  controllers: [CorreccionesController],
  providers: [CorreccionesService],
  exports: [CorreccionesService],
})
export class CorreccionesModule {}