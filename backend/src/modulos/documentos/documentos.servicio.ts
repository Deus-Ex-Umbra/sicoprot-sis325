import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Documento } from './entidades/documento.entidad';
import { Repository } from 'typeorm';
import { Proyecto } from '../proyectos/entidades/proyecto.endidad';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private readonly repositorio_documento: Repository<Documento>,
    @InjectRepository(Proyecto)
    private readonly repositorio_proyecto: Repository<Proyecto>,
  ) {}

  async guardarRegistro(proyectoId: number, archivo: Express.Multer.File) {
    const proyecto = await this.repositorio_proyecto.findOneBy({ id: proyectoId });
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID '${proyectoId}' no encontrado.`);
    }

    const nuevo_documento = this.repositorio_documento.create({
      nombre_archivo: archivo.originalname,
      ruta_archivo: archivo.path,
      proyecto: proyecto,
    });

    return this.repositorio_documento.save(nuevo_documento);
  }

  async obtenerUno(id: number): Promise<Documento> {
    const documento = await this.repositorio_documento.findOneBy({ id });
    if (!documento) {
      throw new NotFoundException(`Documento con ID '${id}' no encontrado.`);
    }
    return documento;
  }
}