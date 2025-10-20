import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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
    
    const estudiante = await this.repositorio_estudiante.findOne({ 
      where: { usuario: { id: id_usuario_estudiante } },
      relations: ['grupo', 'grupo.asesor']
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID de usuario '${id_usuario_estudiante}' no encontrado.`);
    }

    let asesor: Asesor | null = null;

    if (estudiante.grupo && estudiante.grupo.asesor) {
      asesor = estudiante.grupo.asesor;
      console.log(`Asignando automáticamente al asesor del grupo: ${asesor.nombre} ${asesor.apellido}`);
    } else if (id_asesor) {
      asesor = await this.repositorio_asesor.findOneBy({ id: id_asesor });
      if (!asesor) {
        throw new NotFoundException(`Asesor con ID '${id_asesor}' no encontrado.`);
      }
    } else {
      throw new BadRequestException('Debes estar inscrito en un grupo o especificar un asesor para crear un proyecto.');
    }

    if (!asesor) {
      throw new BadRequestException('No se pudo determinar el asesor para el proyecto.');
    }

    const nuevo_proyecto = this.repositorio_proyecto.create({
      titulo,
      estudiante,
      asesor,
    });

    return this.repositorio_proyecto.save(nuevo_proyecto);
  }

  async obtenerTodos(id_usuario: number, rol: string) {
    const query = this.repositorio_proyecto.createQueryBuilder('proyecto')
      .leftJoinAndSelect('proyecto.estudiante', 'estudiante')
      .leftJoinAndSelect('proyecto.asesor', 'asesor')
      .leftJoinAndSelect('proyecto.documentos', 'documentos')
      .orderBy('proyecto.fecha_creacion', 'DESC');

    if (rol === 'estudiante') {
      const estudiante = await this.repositorio_estudiante.findOne({
        where: { usuario: { id: id_usuario } }
      });
      
      if (!estudiante) {
        throw new NotFoundException('Estudiante no encontrado.');
      }
      
      query.where('proyecto.estudiante.id = :estudianteId', { estudianteId: estudiante.id });
    } else if (rol === 'asesor') {
      const asesor = await this.repositorio_asesor.findOne({
        where: { usuario: { id: id_usuario } }
      });
      
      if (!asesor) {
        throw new NotFoundException('Asesor no encontrado.');
      }
      
      query.where('proyecto.asesor.id = :asesorId', { asesorId: asesor.id });
    }

    return query.getMany();
  }
  
  async obtenerUno(id: number, id_usuario: number, rol: string) {
    const proyecto = await this.repositorio_proyecto.findOne({ 
      where: { id },
      relations: ['estudiante', 'estudiante.usuario', 'asesor', 'documentos'] 
    });
    
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID '${id}' no encontrado.`);
    }

    if (rol === 'estudiante') {
      const estudiante = await this.repositorio_estudiante.findOne({
        where: { usuario: { id: id_usuario } }
      });
      
      if (!estudiante || proyecto.estudiante.id !== estudiante.id) {
        throw new ForbiddenException('No tienes permiso para acceder a este proyecto.');
      }
    } else if (rol === 'asesor') {
      const asesor = await this.repositorio_asesor.findOne({
        where: { usuario: { id: id_usuario } }
      });
      
      if (!asesor || proyecto.asesor.id !== asesor.id) {
        throw new ForbiddenException('No tienes permiso para acceder a este proyecto.');
      }
    }

    return proyecto;
  }
}