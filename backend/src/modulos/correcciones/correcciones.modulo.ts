import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorreccionesService } from './correcciones.servicio';
import { CorreccionesController } from './correcciones.controlador';
import { Correccion } from './entidades/correccion.entidad';
import { Observacion } from '../observaciones/entidades/observacion.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Documento } from '../documentos/entidades/documento.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';

/**
 * MÓDULO: Correcciones
 * 
 * VERSIÓN FUSIONADA:
 * - Registra todas las entidades necesarias directamente con TypeOrmModule
 * - Incluye Controller y Service
 * - Exporta el Service para que ObservacionesModule lo use
 * 
 * DIFERENCIA con versión anterior:
 * - Antes: Importaba módulos completos (ObservacionesModule, EstudiantesModule, etc.)
 * - Ahora: Importa solo las entidades necesarias
 * - Ventaja: Evita dependencias circulares entre módulos
 */
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
    TypeOrmModule,        // Para que otros módulos accedan a Repository<Correccion>
    CorreccionesService,  // Para que ObservacionesService lo inyecte
  ],
})
export class CorreccionesModule {}