import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from './entidades/proyecto.endidad';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly repositorio_proyecto: Repository<Proyecto>,
    @InjectRepository(Estudiante)
    private readonly repositorio_estudiante: Repository<Estudiante>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
  ) {}

  async crear(crear_proyecto_dto: CrearProyectoDto, id_usuario_estudiante: number) {
    const { id_asesor, titulo } = crear_proyecto_dto;
    
    const estudiante = await this.repositorio_estudiante.findOne({ where: { usuario: { id: id_usuario_estudiante } } });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID de usuario '${id_usuario_estudiante}' no encontrado.`);
    }

    const asesor = await this.repositorio_asesor.findOneBy({ id: id_asesor });
    if (!asesor) {
      throw new NotFoundException(`Asesor con ID '${id_asesor}' no encontrado.`);
    }

    const nuevo_proyecto = this.repositorio_proyecto.create({
      titulo,
      estudiante,
      asesor,
    });

    return this.repositorio_proyecto.save(nuevo_proyecto);
  }

  async obtenerTodos() {
    return this.repositorio_proyecto.find({
      relations: ['estudiante', 'asesor', 'documentos'],
      order: { fecha_creacion: 'DESC' },
    });
  }
  
  async obtenerUno(id: number) {
    const proyecto = await this.repositorio_proyecto.findOne({ 
      where: { id },
      relations: ['estudiante', 'asesor', 'documentos'] 
    });
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID '${id}' no encontrado.`);
    }
    return proyecto;
  }
}