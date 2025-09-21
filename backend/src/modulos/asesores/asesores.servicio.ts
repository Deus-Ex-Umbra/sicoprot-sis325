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

  findAll() {
    return this.asesoresRepository.find({ relations: ['usuario'] });
  }
}