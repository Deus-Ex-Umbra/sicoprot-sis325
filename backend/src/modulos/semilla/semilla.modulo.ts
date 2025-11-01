// src/semilla/semilla.module.ts
import { Module } from '@nestjs/common';
import { SemillaService } from './semilla.servicio';

// Importa TODOS los módulos que contienen entidades usadas en el seed
import { UsuariosModule } from '../usuarios/usuarios.modulo';
import { AsesoresModule } from '../asesores/asesores.modulo';
import { EstudiantesModule } from '../estudiantes/estudiantes.modulo';
import { ProyectosModule } from '../proyectos/proyectos.modulo';
import { DocumentosModule } from '../documentos/documentos.modulo';
import { ObservacionesModule } from '../observaciones/observaciones.modulo';

@Module({
  imports: [
    UsuariosModule,
    AsesoresModule,       // ← para Asesor
    EstudiantesModule,    // ← para Estudiante
    ProyectosModule,      // ← para Proyecto
    DocumentosModule,     // ← para Documento
    ObservacionesModule,  // ← para Observacion
  ],
  providers: [SemillaService],
  exports: [SemillaService], // opcional, pero bueno tenerlo
})
export class SemillaModule {}