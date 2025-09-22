import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservacionesController } from './observaciones.controlador'; // Ajustado a nombre en español consistente
import { ObservacionesService } from './observaciones.servicio'; // Ajustado a nombre en español consistente
import { Observacion } from './entidades/observacion.entidad'; // Usando la entidad del segundo bloque para consistencia
import { DocumentosModule } from '../documentos/documentos.modulo';
import { AsesoresModule } from '../asesores/asesores.modulo';
import { EstudiantesModule } from '../estudiantes/estudiantes.modulo';
// Si tienes un módulo de notificaciones, agrégalo aquí si es necesario
// import { NotificacionesModule } from '../notificaciones/notificaciones.modulo';

@Module({
  imports: [
    TypeOrmModule.forFeature([Observacion]),
    DocumentosModule,
    AsesoresModule,
    EstudiantesModule,
    // NotificacionesModule, // Descomenta si integras notificaciones reales
  ],
  controllers: [ObservacionesController],
  providers: [ObservacionesService],
  exports: [
    TypeOrmModule,  ObservacionesService], // Cambiado a exportar el servicio, como en el primer bloque (más estándar)
})
export class ObservacionesModule {}
