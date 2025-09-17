import { Module } from '@nestjs/common';
import { DocumentosService } from './documentos.servicio';
import { DocumentosController } from './documentos.controlador';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documento } from './entidades/documento.entidad';
import { ProyectosModule } from '../proyectos/proyectos.modulo';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([Documento]),
    ProyectosModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [DocumentosController],
  providers: [DocumentosService],
  exports: [TypeOrmModule],
})
export class DocumentosModule {}