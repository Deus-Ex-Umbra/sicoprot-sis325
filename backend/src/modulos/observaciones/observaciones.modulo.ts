import { Module } from '@nestjs/common';
import { ObservacionesService } from './observaciones.servicio';
import { ObservacionesController } from './observaciones.controlador';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Observacion } from './entidades/observacion.entidad';
import { DocumentosModule } from '../documentos/documentos.modulo';
import { UsuariosModule } from '../usuarios/usuarios.modulo';

@Module({
  imports: [
    TypeOrmModule.forFeature([Observacion]),
    DocumentosModule,
    UsuariosModule,
  ],
  controllers: [ObservacionesController],
  providers: [ObservacionesService],
})
export class ObservacionesModule {}