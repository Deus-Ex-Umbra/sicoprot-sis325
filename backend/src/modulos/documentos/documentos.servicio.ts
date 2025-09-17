import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Documento } from './entidades/documento.entidad';
import { Repository } from 'typeorm';
import { Proyecto } from '../proyectos/entidades/proyecto.endidad';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private readonly documentoRepositorio: Repository<Documento>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepositorio: Repository<Proyecto>,
  ) {}

  async guardarRegistro(proyectoId: string, archivo: Express.Multer.File) {
    const proyecto = await this.proyectoRepositorio.findOneBy({ id: proyectoId });
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID '${proyectoId}' no encontrado.`);
    }

    const nuevoDocumento = this.documentoRepositorio.create({
      nombre_archivo: archivo.originalname,
      ruta_archivo: archivo.path,
      proyecto: proyecto,
    });

    return this.documentoRepositorio.save(nuevoDocumento);
  }
}