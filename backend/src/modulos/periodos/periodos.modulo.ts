import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Periodo } from './entidades/periodo.entidad';
import { PeriodosController } from './periodos.controlador';
import { PeriodosService } from './periodos.servicio';

@Module({
  imports: [TypeOrmModule.forFeature([Periodo])],
  controllers: [PeriodosController],
  providers: [PeriodosService],
  exports: [TypeOrmModule, PeriodosService],
})
export class PeriodosModule {}