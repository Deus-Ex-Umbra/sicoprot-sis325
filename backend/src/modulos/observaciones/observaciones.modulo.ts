import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservacionesController } from './observaciones.controlador';
import { ObservacionesService } from './observaciones.servicio';
import { Observacion } from './entidades/observacion.entidad';
import { DocumentosModule } from '../documentos/documentos.modulo';
import { AsesoresModule } from '../asesores/asesores.modulo';
import { EstudiantesModule } from '../estudiantes/estudiantes.modulo';
import { CorreccionesModule } from '../correcciones/correcciones.modulo';

@Module({
  imports: [
    TypeOrmModule.forFeature([Observacion]),
    DocumentosModule,
    AsesoresModule,
    EstudiantesModule,
    forwardRef(() => CorreccionesModule),
  ],
  controllers: [ObservacionesController],
  providers: [ObservacionesService],
  exports: [TypeOrmModule, ObservacionesService],
})
export class ObservacionesModule {}