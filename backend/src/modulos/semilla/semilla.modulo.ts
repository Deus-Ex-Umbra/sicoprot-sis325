import { Module } from '@nestjs/common';
import { SemillaService } from './semilla.servicio';
import { UsuariosModule } from '../usuarios/usuarios.modulo';
import { AsesoresModule } from '../asesores/asesores.modulo';
import { EstudiantesModule } from '../estudiantes/estudiantes.modulo';
import { ProyectosModule } from '../proyectos/proyectos.modulo';
import { DocumentosModule } from '../documentos/documentos.modulo';
import { ObservacionesModule } from '../observaciones/observaciones.modulo';

@Module({
  imports: [
    UsuariosModule,
    AsesoresModule,
    EstudiantesModule,
    ProyectosModule,
    DocumentosModule,
    ObservacionesModule,
  ],
  providers: [SemillaService],
  exports: [SemillaService], 
})
export class SemillaModule {}