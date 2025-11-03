import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reunion } from './entidades/reunion.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Proyecto } from '../proyectos/entidades/proyecto.endidad';
import { CrearReunionDto } from './dto/crear-reuinion.dto';
import { ActualizarReunionDto } from './dto/actualizar-reunion.dto';
import { Rol } from '../usuarios/enums/rol.enum';

@Injectable()
export class ReunionesService {
  constructor(
    @InjectRepository(Reunion)
    private readonly repositorio_reunion: Repository<Reunion>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
    @InjectRepository(Proyecto)
    private readonly repositorio_proyecto: Repository<Proyecto>,
  ) {}

  async crearReunion(crearDto: CrearReunionDto, id_usuario_asesor: number): Promise<Reunion> {
    const asesor = await this.repositorio_asesor.findOneBy({ usuario: { id: id_usuario_asesor } });
    if (!asesor) {
      throw new ForbiddenException('Solo los asesores pueden crear reuniones.');
    }

    const proyecto = await this.repositorio_proyecto.findOne({
      where: { id: crearDto.id_proyecto, asesor: { id: asesor.id } },
    });
    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado o no te pertenece.');
    }

    const nueva_reunion = this.repositorio_reunion.create({
      ...crearDto,
      asesor,
      proyecto,
    });

    return this.repositorio_reunion.save(nueva_reunion);
  }

  async obtenerPorProyecto(id_proyecto: number, id_usuario: number, rol: Rol) {
    const proyecto = await this.repositorio_proyecto.findOne({
      where: { id: id_proyecto },
      relations: ['estudiantes', 'estudiantes.usuario', 'asesor', 'asesor.usuario'],
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado.');
    }

    if (rol === Rol.Estudiante && !proyecto.estudiantes.some(e => e.usuario.id === id_usuario)) {
      throw new ForbiddenException('No tienes permiso para ver estas reuniones.');
    }
    
    if (rol === Rol.Asesor && proyecto.asesor.usuario.id !== id_usuario) {
      throw new ForbiddenException('No tienes permiso para ver estas reuniones.');
    }

    return this.repositorio_reunion.find({
      where: { proyecto: { id: id_proyecto } },
      order: { fecha_programada: 'DESC' },
    });
  }

  async obtenerUna(id: number, id_usuario: number, rol: Rol): Promise<Reunion> {
    const reunion = await this.repositorio_reunion.findOne({
      where: { id },
      relations: ['proyecto', 'proyecto.estudiantes', 'proyecto.estudiantes.usuario', 'proyecto.asesor', 'proyecto.asesor.usuario'],
    });

    if (!reunion) {
      throw new NotFoundException('Reunión no encontrada.');
    }

    const proyecto = reunion.proyecto;

    if (rol === Rol.Estudiante && !proyecto.estudiantes.some(e => e.usuario.id === id_usuario)) {
      throw new ForbiddenException('No tienes permiso para ver esta reunión.');
    }
    
    if (rol === Rol.Asesor && proyecto.asesor.usuario.id !== id_usuario) {
      throw new ForbiddenException('No tienes permiso para ver esta reunión.');
    }

    return reunion;
  }

  async actualizarReunion(id: number, actualizarDto: ActualizarReunionDto, id_usuario_asesor: number): Promise<Reunion> {
    const asesor = await this.repositorio_asesor.findOneBy({ usuario: { id: id_usuario_asesor } });
    if (!asesor) {
      throw new ForbiddenException('Solo los asesores pueden actualizar reuniones.');
    }
    
    const reunion = await this.repositorio_reunion.findOne({
      where: { id, asesor: { id: asesor.id } },
    });
    
    if (!reunion) {
      throw new NotFoundException('Reunión no encontrada o no te pertenece.');
    }

    Object.assign(reunion, actualizarDto);
    return this.repositorio_reunion.save(reunion);
  }

  async eliminarReunion(id: number, id_usuario_asesor: number) {
    const asesor = await this.repositorio_asesor.findOneBy({ usuario: { id: id_usuario_asesor } });
    if (!asesor) {
      throw new ForbiddenException('Solo los asesores pueden eliminar reuniones.');
    }
    
    const resultado = await this.repositorio_reunion.delete({
      id,
      asesor: { id: asesor.id }
    });

    if (resultado.affected === 0) {
      throw new NotFoundException('Reunión no encontrada o no te pertenece.');
    }

    return { message: 'Reunión eliminada/cancelada.' };
  }
}