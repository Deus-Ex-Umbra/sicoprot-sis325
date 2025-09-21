import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asesor } from './entidades/asesor.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([Asesor])],
  exports: [TypeOrmModule],
})
export class AsesoresModule {}