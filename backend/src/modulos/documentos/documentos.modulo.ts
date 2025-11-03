import { Module } from '@nestjs/common';
import { DocumentosService } from './documentos.servicio';
import { DocumentosController } from './documentos.controlador';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documento } from './entidades/documento.entidad';
import { MulterModule } from '@nestjs/platform-express';
import { Proyecto } from '../proyectos/entidades/proyecto.endidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([Documento, Proyecto]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [DocumentosController],
  providers: [DocumentosService],
  exports: [TypeOrmModule, DocumentosService],
})
export class DocumentosModule {}