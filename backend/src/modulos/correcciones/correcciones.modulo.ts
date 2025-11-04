import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorreccionesService } from './correcciones.servicio';
import { CorreccionesController } from './correcciones.controlador';
import { Correccion } from './entidades/correccion.entidad';
import { Observacion } from '../observaciones/entidades/observacion.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Documento } from '../documentos/entidades/documento.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Correccion,
      Observacion,
      Estudiante,
      Documento,
      Asesor,
    ]),
  ],
  controllers: [CorreccionesController],
  providers: [CorreccionesService],
  exports: [
    TypeOrmModule,
    CorreccionesService,
  ],
})
export class CorreccionesModule {}