import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorreccionesService } from './correcciones.servicio';
import { CorreccionesController } from './correcciones.controlador';
import { Correccion } from './entidades/correccion.entidad';
import { ObservacionesModule } from '../observaciones/observaciones.modulo';
import { EstudiantesModule } from '../estudiantes/estudiantes.modulo';
import { DocumentosModule } from '../documentos/documentos.modulo';


@Module({
  imports: [
    TypeOrmModule.forFeature([Correccion]),
    ObservacionesModule,
    EstudiantesModule,
    DocumentosModule,
  ],
  controllers: [CorreccionesController],
  providers: [CorreccionesService],
  exports: [TypeOrmModule],
})
export class CorreccionesModule {}