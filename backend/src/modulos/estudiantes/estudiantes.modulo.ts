import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estudiante } from './entidades/estudiante.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([Estudiante])],
  exports: [TypeOrmModule],
})
export class EstudiantesModule {}