import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from './entidades/proyecto.endidad';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Rol } from '../usuarios/enums/rol.enum';

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
    } else if (id_asesor) {
      asesor = await this.repositorio_asesor.findOneBy({ id: id_asesor });
      if (!asesor) {
        throw new NotFoundException(`Asesor con ID '${id_asesor}' no encontrado.`);
      }
    } else {
      throw new BadRequestException('Debes estar inscrito en un grupo con asesor asignado o especificar un asesor para crear un proyecto.');
    }

    if (!asesor) {
      throw new BadRequestException('No se pudo determinar el asesor para el proyecto.');
    }

    // ✅ CORRECTO: solo asignamos 'asesor' (singular), NO 'estudiante'
    const nuevo_proyecto = this.repositorio_proyecto.create({
      titulo,
      asesor,
    });

    const proyecto_guardado = await this.repositorio_proyecto.save(nuevo_proyecto);

    // ✅ VINCULAMOS AL ESTUDIANTE AL PROYECTO (desde el lado del estudiante)
    estudiante.proyecto = proyecto_guardado;
    await this.repositorio_estudiante.save(estudiante);

    return proyecto_guardado;
  }

  async obtenerTodos(id_usuario: number, rol: string) {
    const query = this.repositorio_proyecto.createQueryBuilder('proyecto')
      .leftJoinAndSelect('proyecto.estudiantes', 'estudiante') // ✅ 'estudiantes' (plural)
      .leftJoinAndSelect('estudiante.usuario', 'usuario_estudiante') // opcional, si necesitas el usuario
      .leftJoinAndSelect('proyecto.asesor', 'asesor')
      .leftJoinAndSelect('proyecto.documentos', 'documentos')
      .orderBy('proyecto.fecha_creacion', 'DESC');

    if (rol === Rol.Estudiante) {
      const estudiante = await this.repositorio_estudiante.findOne({
        where: { usuario: { id: id_usuario } }
      });

      if (!estudiante) {
        throw new NotFoundException('Estudiante no encontrado.');
      }

      query.andWhere('estudiante.id = :estudianteId', { estudianteId: estudiante.id });
    } else if (rol === Rol.Asesor) {
      const asesor = await this.repositorio_asesor.findOne({
        where: { usuario: { id: id_usuario } }
      });

      if (!asesor) {
        throw new NotFoundException('Asesor no encontrado.');
      }

      query.andWhere('asesor.id = :asesorId', { asesorId: asesor.id });
    }

    return query.getMany();
  }

  async obtenerUno(id: number, id_usuario: number, rol: string) {
    const proyecto = await this.repositorio_proyecto.findOne({
      where: { id },
      relations: ['estudiantes', 'estudiantes.usuario', 'asesor', 'asesor.usuario'],
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID '${id}' no encontrado.`);
    }

    if (rol === Rol.Estudiante) {
      const esMiembroDelProyecto = proyecto.estudiantes?.some(
        estudiante => estudiante.usuario?.id === id_usuario
      );

      if (!esMiembroDelProyecto) {
        throw new ForbiddenException('No tienes permiso para acceder a este proyecto.');
      }
    } else if (rol === Rol.Asesor) {
      if (!proyecto.asesor || proyecto.asesor.usuario?.id !== id_usuario) {
        throw new ForbiddenException('No tienes permiso para acceder a este proyecto.');
      }
    }

    return proyecto;
  }
}