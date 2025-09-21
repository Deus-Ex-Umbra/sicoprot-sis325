import { Module } from '@nestjs/common';
import { ObservacionesService } from './observaciones.servicio';
import { ObservacionesController } from './observaciones.controlador';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Observacion } from './entidades/observacion.entidad';
import { DocumentosModule } from '../documentos/documentos.modulo';
import { AsesoresModule } from '../asesores/asesores.modulo';
import { EstudiantesModule } from '../estudiantes/estudiantes.modulo';

@Module({
  imports: [
    TypeOrmModule.forFeature([Observacion]),
    DocumentosModule,
    AsesoresModule,
    EstudiantesModule,
  ],
  controllers: [ObservacionesController],
  providers: [ObservacionesService],
  exports: [TypeOrmModule],
})
export class ObservacionesModule {}