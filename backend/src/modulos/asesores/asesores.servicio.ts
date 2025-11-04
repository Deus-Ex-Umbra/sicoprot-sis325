import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asesor } from './entidades/asesor.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
@Injectable()
export class AsesoresService {
  constructor(
    @InjectRepository(Asesor)
    private readonly asesoresRepository: Repository<Asesor>,

    @InjectRepository(Estudiante)
    private readonly estudiantesRepository: Repository<Estudiante>,
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
  
  async obtenerEstudiantesDeMiGrupo(id_usuario: number) {
    const asesor = await this.asesoresRepository.findOne({
      where: { usuario: { id: id_usuario } },
      relations: [
        'grupos',
        'grupos.periodo',
        'grupos.estudiantes',
        'grupos.estudiantes.usuario',
        'grupos.estudiantes.proyecto',
      ],
    });

    if (!asesor) {
      throw new ForbiddenException('Solo los asesores pueden acceder a esta información.');
    }
    if (!asesor.grupos || asesor.grupos.length === 0) {
      return { grupos: [] };
    }
    const grupos_con_estudiantes = asesor.grupos.map(grupo => ({
      id: grupo.id,
      nombre: grupo.nombre,
      tipo: grupo.tipo,
      descripcion: grupo.descripcion,
      activo: grupo.activo,
      periodo: grupo.periodo,
      estudiantes: grupo.estudiantes.map(estudiante => ({
        id: estudiante.id,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        correo: estudiante.usuario?.correo || 'Sin correo',
        proyecto: estudiante.proyecto?.titulo || 'Sin proyecto',
      })),
    }));

    return { grupos: grupos_con_estudiantes };
  }
}