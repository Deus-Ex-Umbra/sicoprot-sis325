import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asesor } from './entidades/asesor.entidad';

@Injectable()
export class AsesoresService {
  constructor(
    @InjectRepository(Asesor)
    private readonly asesoresRepository: Repository<Asesor>,
  ) {}

  async findAll() {
    const asesores = await this.asesoresRepository.find({ relations: ['usuario'] });
    
    return asesores.map(asesor => ({
      ...asesor.usuario,
      perfil: {
        id_asesor: asesor.id,
        nombre: asesor.nombre,
        apellido: asesor.apellido,
      }
    }));
  }
}