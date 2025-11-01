import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asesor } from './entidades/asesor.entidad';
import { AsesoresController } from './asesores.controlador';
import { AsesoresService } from './asesores.servicio';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad'; 

@Module({
  imports: [TypeOrmModule.forFeature([Asesor,Estudiante])],
  controllers: [AsesoresController],
  providers: [AsesoresService],
  exports: [TypeOrmModule],
})
export class AsesoresModule {}