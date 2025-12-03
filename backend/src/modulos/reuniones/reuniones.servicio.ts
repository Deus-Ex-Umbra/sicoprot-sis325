import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Reunion, EstadoReunion } from './entidades/reunion.entidad';
import { ObservacionReunion, EstadoObservacionReunion } from './entidades/observacion-reunion.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Proyecto } from '../proyectos/entidades/proyecto.endidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { CrearReunionDto } from './dto/crear-reuinion.dto';
import { ProponerReunionDto } from './dto/proponer-reunion.dto';
import { AgendarReunionDto } from './dto/agendar-reunion.dto';
import { ActualizarReunionDto } from './dto/actualizar-reunion.dto';
import { CrearObservacionReunionDto } from './dto/crear-observacion-reunion.dto';
import { Rol } from '../usuarios/enums/rol.enum';

@Injectable()
export class ReunionesService {
  constructor(
    @InjectRepository(Reunion)
    private readonly repositorio_reunion: Repository<Reunion>,
    @InjectRepository(ObservacionReunion)
    private readonly repositorio_observacion: Repository<ObservacionReunion>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
    @InjectRepository(Proyecto)
    private readonly repositorio_proyecto: Repository<Proyecto>,
    @InjectRepository(Estudiante)
    private readonly repositorio_estudiante: Repository<Estudiante>,
  ) {}

  async proponerReunion(dto: ProponerReunionDto, id_usuario_asesor: number) {
    const asesor = await this.repositorio_asesor.findOneBy({ usuario: { id: id_usuario_asesor } });
    if (!asesor) throw new ForbiddenException('Solo asesores pueden proponer reuniones.');

    const proyecto = await this.repositorio_proyecto.findOneBy({ id: dto.id_proyecto });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado.');

    const reunion = this.repositorio_reunion.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      rango_fecha_inicio: dto.rango_fecha_inicio,
      rango_fecha_fin: dto.rango_fecha_fin,
      estado: EstadoReunion.SOLICITADA,
      asesor,
      proyecto,
    });

    return this.repositorio_reunion.save(reunion);
  }

  async agendarReunion(id_reunion: number, dto: AgendarReunionDto, id_usuario_estudiante: number) {
    const estudiante = await this.repositorio_estudiante.findOne({
        where: { usuario: { id: id_usuario_estudiante } },
        relations: ['proyecto']
    });
    if (!estudiante) throw new ForbiddenException('Estudiante no encontrado.');
    
    const reunion = await this.repositorio_reunion.findOne({
        where: { id: id_reunion },
        relations: ['proyecto']
    });

    if (!reunion) throw new NotFoundException('Reunión no encontrada.');
    if (reunion.proyecto.id !== estudiante.proyecto.id) throw new ForbiddenException('No puedes agendar esta reunión.');
    if (reunion.estado !== EstadoReunion.SOLICITADA && reunion.estado !== EstadoReunion.PENDIENTE_CONFIRMACION) {
        throw new BadRequestException('La reunión no está en estado de solicitud.');
    }

    // Validar rango
    const fecha = new Date(dto.fecha_programada);
    if (reunion.rango_fecha_inicio && fecha < new Date(reunion.rango_fecha_inicio)) {
        throw new BadRequestException('La fecha está fuera del rango inicial permitido.');
    }
    if (reunion.rango_fecha_fin && fecha > new Date(reunion.rango_fecha_fin)) {
        throw new BadRequestException('La fecha está fuera del rango final permitido.');
    }

    reunion.fecha_programada = fecha;
    reunion.estado = EstadoReunion.PENDIENTE_CONFIRMACION;
    return this.repositorio_reunion.save(reunion);
  }

  async confirmarReunion(id_reunion: number, id_usuario_asesor: number) {
    const asesor = await this.repositorio_asesor.findOneBy({ usuario: { id: id_usuario_asesor } });
    if (!asesor) throw new ForbiddenException('Asesor no encontrado.');

    const reunion = await this.repositorio_reunion.findOne({
        where: { id: id_reunion },
        relations: ['asesor']
    });

    if (!reunion) throw new NotFoundException('Reunión no encontrada.');
    if (reunion.asesor.id !== asesor.id) throw new ForbiddenException('No es tu reunión.');
    if (reunion.estado !== EstadoReunion.PENDIENTE_CONFIRMACION) throw new BadRequestException('La reunión no está pendiente de confirmación.');

    reunion.estado = EstadoReunion.PROGRAMADA;
    return this.repositorio_reunion.save(reunion);
  }

  async crearObservacion(dto: CrearObservacionReunionDto, id_usuario_asesor: number) {
    const asesor = await this.repositorio_asesor.findOneBy({ usuario: { id: id_usuario_asesor } });
    if (!asesor) throw new ForbiddenException('Asesor no encontrado.');

    const reunion = await this.repositorio_reunion.findOne({
        where: { id: dto.id_reunion },
        relations: ['asesor']
    });

    if (!reunion) throw new NotFoundException('Reunión no encontrada.');
    if (reunion.asesor.id !== asesor.id) throw new ForbiddenException('No es tu reunión.');

    const observacion = this.repositorio_observacion.create({
        descripcion: dto.descripcion,
        reunion,
        estado: EstadoObservacionReunion.PENDIENTE
    });

    return this.repositorio_observacion.save(observacion);
  }

  async marcarObservacionCorregida(id_observacion: number, id_usuario_asesor: number) {
      const obs = await this.repositorio_observacion.findOne({
          where: { id: id_observacion },
          relations: ['reunion', 'reunion.asesor']
      });
      
      if (!obs) throw new NotFoundException('Observación no encontrada.');
      if (obs.reunion.asesor.usuario.id !== id_usuario_asesor) throw new ForbiddenException('No autorizado.');

      obs.estado = EstadoObservacionReunion.CORREGIDA;
      return this.repositorio_observacion.save(obs);
  }

  async obtenerObservacionesPendientes(id_proyecto: number) {
      return this.repositorio_observacion.find({
          where: {
              reunion: { proyecto: { id: id_proyecto } },
              estado: EstadoObservacionReunion.PENDIENTE
          },
          relations: ['reunion'],
          order: { fecha_creacion: 'ASC' }
      });
  }

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
      estado: EstadoReunion.PROGRAMADA // Creación directa antigua
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

    // Validar acceso (simplificado)
    // ...

    return this.repositorio_reunion.find({
      where: { proyecto: { id: id_proyecto } },
      relations: ['observaciones'],
      order: { fecha_programada: 'DESC' },
    });
  }

  async obtenerUna(id: number, id_usuario: number, rol: Rol) {
      return this.repositorio_reunion.findOne({
          where: { id },
          relations: ['observaciones', 'proyecto']
      });
  }

  async actualizarReunion(id: number, dto: ActualizarReunionDto, id_usuario: number) {
      // Implementación básica
      return this.repositorio_reunion.update(id, dto);
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