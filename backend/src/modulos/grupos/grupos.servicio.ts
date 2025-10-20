import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from './entidades/grupo.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Periodo } from '../periodos/entidades/periodo.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { CrearGrupoDto } from './dto/crear-grupo.dto';
import { ActualizarGrupoDto } from './dto/actualizar-grupo.dto';

@Injectable()
export class GruposService {
  constructor(
    @InjectRepository(Grupo)
    private readonly repositorio_grupo: Repository<Grupo>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
    @InjectRepository(Periodo)
    private readonly repositorio_periodo: Repository<Periodo>,
    @InjectRepository(Estudiante)
    private readonly repositorio_estudiante: Repository<Estudiante>,
  ) {}

  async crear(crear_grupo_dto: CrearGrupoDto) {
    const asesor = await this.repositorio_asesor.findOneBy({ id: crear_grupo_dto.id_asesor });
    if (!asesor) {
      throw new NotFoundException(`Asesor con ID '${crear_grupo_dto.id_asesor}' no encontrado.`);
    }

    const periodo = await this.repositorio_periodo.findOneBy({ id: crear_grupo_dto.id_periodo });
    if (!periodo) {
      throw new NotFoundException(`Período con ID '${crear_grupo_dto.id_periodo}' no encontrado.`);
    }

    const nuevo_grupo = this.repositorio_grupo.create({
      nombre: crear_grupo_dto.nombre,
      descripcion: crear_grupo_dto.descripcion,
      activo: crear_grupo_dto.activo ?? true,
      asesor,
      periodo,
    });

    return this.repositorio_grupo.save(nuevo_grupo);
  }

  async obtenerTodos() {
    return this.repositorio_grupo.find({
      relations: ['asesor', 'asesor.usuario', 'periodo', 'estudiantes', 'estudiantes.usuario'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async obtenerPorPeriodo(id_periodo: number) {
    return this.repositorio_grupo.find({
      where: { periodo: { id: id_periodo } },
      relations: ['asesor', 'asesor.usuario', 'periodo', 'estudiantes', 'estudiantes.usuario'],
    });
  }

  async obtenerUno(id: number) {
    const grupo = await this.repositorio_grupo.findOne({
      where: { id },
      relations: ['asesor', 'asesor.usuario', 'periodo', 'estudiantes', 'estudiantes.usuario'],
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID '${id}' no encontrado.`);
    }

    return grupo;
  }

  async actualizar(id: number, actualizar_grupo_dto: ActualizarGrupoDto) {
    const grupo = await this.repositorio_grupo.findOneBy({ id });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID '${id}' no encontrado.`);
    }

    if (actualizar_grupo_dto.id_asesor) {
      const asesor = await this.repositorio_asesor.findOneBy({ id: actualizar_grupo_dto.id_asesor });
      if (!asesor) {
        throw new NotFoundException(`Asesor con ID '${actualizar_grupo_dto.id_asesor}' no encontrado.`);
      }
      grupo.asesor = asesor;
    }

    if (actualizar_grupo_dto.id_periodo) {
      const periodo = await this.repositorio_periodo.findOneBy({ id: actualizar_grupo_dto.id_periodo });
      if (!periodo) {
        throw new NotFoundException(`Período con ID '${actualizar_grupo_dto.id_periodo}' no encontrado.`);
      }
      grupo.periodo = periodo;
    }

    if (actualizar_grupo_dto.nombre !== undefined) grupo.nombre = actualizar_grupo_dto.nombre;
    if (actualizar_grupo_dto.descripcion !== undefined) grupo.descripcion = actualizar_grupo_dto.descripcion;
    if (actualizar_grupo_dto.activo !== undefined) grupo.activo = actualizar_grupo_dto.activo;

    return this.repositorio_grupo.save(grupo);
  }

  async asignarEstudiante(id_grupo: number, id_estudiante: number) {
    const grupo = await this.repositorio_grupo.findOne({
      where: { id: id_grupo },
      relations: ['estudiantes'],
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID '${id_grupo}' no encontrado.`);
    }

    if (!grupo.activo) {
      throw new BadRequestException('No se puede asignar estudiantes a un grupo inactivo.');
    }

    const estudiante = await this.repositorio_estudiante.findOne({
      where: { id: id_estudiante },
      relations: ['grupo'],
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID '${id_estudiante}' no encontrado.`);
    }

    if (estudiante.grupo && estudiante.grupo.id !== id_grupo) {
      throw new BadRequestException('El estudiante ya pertenece a otro grupo. Debes removerlo primero.');
    }

    estudiante.grupo = grupo;
    await this.repositorio_estudiante.save(estudiante);

    return this.obtenerUno(id_grupo);
  }

  async removerEstudiante(id_grupo: number, id_estudiante: number) {
    const estudiante = await this.repositorio_estudiante.findOne({
      where: { id: id_estudiante },
      relations: ['grupo'],
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID '${id_estudiante}' no encontrado.`);
    }

    if (!estudiante.grupo || estudiante.grupo.id !== id_grupo) {
      throw new BadRequestException('El estudiante no pertenece a este grupo.');
    }

    estudiante.grupo = undefined as any;
    await this.repositorio_estudiante.save(estudiante);

    return this.obtenerUno(id_grupo);
  }

  async eliminar(id: number) {
    const grupo = await this.repositorio_grupo.findOne({
      where: { id },
      relations: ['estudiantes'],
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID '${id}' no encontrado.`);
    }

    if (grupo.estudiantes && grupo.estudiantes.length > 0) {
      throw new BadRequestException('No se puede eliminar un grupo que tiene estudiantes asignados.');
    }

    await this.repositorio_grupo.remove(grupo);
    return { message: `Grupo con ID '${id}' eliminado exitosamente.` };
  }
}