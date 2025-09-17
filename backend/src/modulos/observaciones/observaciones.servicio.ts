import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observacion } from './entidades/observacion.entidad';
import { Repository } from 'typeorm';
import { CrearObservacionDto } from './dto/crear-observacion.dto';
import { Documento } from '../documentos/entidades/documento.entidad';
import { Usuario } from '../usuarios/entidades/usuario.entidad';

@Injectable()
export class ObservacionesService {
  constructor(
    @InjectRepository(Observacion)
    private readonly observacionRepositorio: Repository<Observacion>,
    @InjectRepository(Documento)
    private readonly documentoRepositorio: Repository<Documento>,
    @InjectRepository(Usuario)
    private readonly usuarioRepositorio: Repository<Usuario>,
  ) {}

  async crear(documentoId: string, crearObservacionDto: CrearObservacionDto) {
    const { contenido, autorId } = crearObservacionDto;
    const documento = await this.documentoRepositorio.findOneBy({ id: documentoId });
    if (!documento) {
      throw new NotFoundException(`Documento con ID '${documentoId}' no encontrado.`);
    }

    const autor = await this.usuarioRepositorio.findOneBy({ id: autorId });
    if (!autor) {
      throw new NotFoundException(`Usuario (autor) con ID '${autorId}' no encontrado.`);
    }

    const nuevaObservacion = this.observacionRepositorio.create({
      contenido,
      documento,
      autor,
    });

    return this.observacionRepositorio.save(nuevaObservacion);
  }

  async obtenerPorDocumento(documentoId: string) {
    return this.observacionRepositorio.find({
      where: { documento: { id: documentoId } },
      order: { fechaCreacion: 'DESC' },
    });
  }
}