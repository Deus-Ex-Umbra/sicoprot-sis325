import { Module } from '@nestjs/common';
import { ProyectosService } from './proyectos.servicio';
import { ProyectosController } from './proyectos.controlador';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from './entidades/proyecto.endidad';
import { EstudiantesModule } from '../estudiantes/estudiantes.modulo';
import { AsesoresModule } from '../asesores/asesores.modulo';
import { GruposModule } from '../grupos/grupos.modulo';
import { PeriodosModule } from '../periodos/periodos.modulo';
import { PropuestasTemaModule } from '../propuestas-tema/propuestas-tema.modulo';
import { ReunionesModule } from '../reuniones/reuniones.modulo';
import { DocumentosModule } from '../documentos/documentos.modulo';
import { ObservacionesModule } from '../observaciones/observaciones.modulo';
import { UsuariosModule } from '../usuarios/usuarios.modulo';
import { PropuestaTema } from '../propuestas-tema/entidades/propuesta-tema.entidad';
import { Reunion } from '../reuniones/entidades/reunion.entidad';
import { Documento } from '../documentos/entidades/documento.entidad';
import { Observacion } from '../observaciones/entidades/observacion.entidad';
import { Periodo } from '../periodos/entidades/periodo.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Proyecto,
      PropuestaTema,
      Reunion,
      Documento,
      Observacion,
      Periodo,
      Estudiante,
      Asesor,
    ]),
    EstudiantesModule,
    AsesoresModule,
    GruposModule,
    PeriodosModule,
    PropuestasTemaModule,
    ReunionesModule,
    DocumentosModule,
    ObservacionesModule,
    UsuariosModule,
  ],
  controllers: [ProyectosController],
  providers: [ProyectosService],
  exports: [TypeOrmModule, ProyectosService],
})
export class ProyectosModule {}