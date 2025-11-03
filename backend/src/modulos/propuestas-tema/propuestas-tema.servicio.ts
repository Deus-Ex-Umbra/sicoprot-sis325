import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropuestaTema } from './entidades/propuesta-tema.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Proyecto } from '../proyectos/entidades/proyecto.endidad';
import { CrearPropuestaTemaDto } from './dto/crear-propuesta-tema.dto';
import { ResponderPropuestaDto } from './dto/responder-propuesta.dto';
import { EstadoPropuesta } from './enums/estado-propuesta.enum';
import { EtapaProyecto } from '../proyectos/enums/etapa-proyecto.enum';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Rol } from '../usuarios/enums/rol.enum';

@Injectable()
export class PropuestasTemaService {
  constructor(
    @InjectRepository(PropuestaTema)
    private readonly repositorio_propuesta: Repository<PropuestaTema>,
    @InjectRepository(Estudiante)
    private readonly repositorio_estudiante: Repository<Estudiante>,
    @InjectRepository(Proyecto)
    private readonly repositorio_proyecto: Repository<Proyecto>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
  ) {}

  async crear(crearDto: CrearPropuestaTemaDto, id_usuario_estudiante: number): Promise<PropuestaTema> {
    const estudiante = await this.repositorio_estudiante.findOneBy({ usuario: { id: id_usuario_estudiante } });
    if (!estudiante) {
      throw new ForbiddenException('Solo los estudiantes pueden crear propuestas.');
    }
    
    const proyecto = await this.repositorio_proyecto.findOne({
        where: { id: crearDto.id_proyecto, estudiantes: { id: estudiante.id } },
    });
    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado o no te pertenece.');
    }

    if (proyecto.etapa_actual !== EtapaProyecto.PROPUESTA) {
      throw new BadRequestException('No se pueden crear nuevas propuestas para este proyecto.');
    }

    const nueva_propuesta = this.repositorio_propuesta.create({
      ...crearDto,
      estudiante,
      proyecto,
    });

    return this.repositorio_propuesta.save(nueva_propuesta);
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
      throw new ForbiddenException('No tienes permiso para ver estas propuestas.');
    }
    
    if (rol === Rol.Asesor && proyecto.asesor.usuario.id !== id_usuario) {
      throw new ForbiddenException('No tienes permiso para ver estas propuestas.');
    }
    
    return this.repositorio_propuesta.find({
      where: { proyecto: { id: id_proyecto } },
      relations: ['estudiante'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async responderPropuesta(id_propuesta: number, responderDto: ResponderPropuestaDto, id_usuario_asesor: number) {
    const asesor = await this.repositorio_asesor.findOneBy({ usuario: { id: id_usuario_asesor } });
    if (!asesor) {
      throw new ForbiddenException('Solo los asesores pueden responder propuestas.');
    }
    
    const propuesta = await this.repositorio_propuesta.findOne({
      where: { id: id_propuesta },
      relations: ['proyecto', 'proyecto.asesor'],
    });

    if (!propuesta) {
      throw new NotFoundException('Propuesta no encontrada.');
    }

    if (propuesta.proyecto.asesor.id !== asesor.id) {
      throw new ForbiddenException('No eres el asesor de este proyecto.');
    }

    if (propuesta.proyecto.etapa_actual !== EtapaProyecto.PROPUESTA) {
      throw new BadRequestException('El proyecto ya no está en etapa de propuesta.');
    }

    propuesta.estado = responderDto.accion;
    propuesta.comentarios_asesor_html = responderDto.comentarios_asesor_html || null;

    if (responderDto.accion === EstadoPropuesta.APROBADA) {
      const proyecto = propuesta.proyecto;
      proyecto.titulo = propuesta.titulo;
      proyecto.etapa_actual = EtapaProyecto.PERFIL;
      proyecto.propuesta_aprobada = true;
      proyecto.fecha_aprobacion_propuesta = new Date();
      await this.repositorio_proyecto.save(proyecto);

      await this.repositorio_propuesta.update(
        { proyecto: { id: proyecto.id }, estado: EstadoPropuesta.PENDIENTE },
        { estado: EstadoPropuesta.RECHAZADA }
      );
    }
    
    return this.repositorio_propuesta.save(propuesta);
  }

  async eliminarPropuesta(id_propuesta: number, id_usuario_estudiante: number) {
    const estudiante = await this.repositorio_estudiante.findOneBy({ usuario: { id: id_usuario_estudiante } });
    if (!estudiante) {
      throw new ForbiddenException('Acción no permitida.');
    }

    const propuesta = await this.repositorio_propuesta.findOne({
      where: { id: id_propuesta, estudiante: { id: estudiante.id } },
    });

    if (!propuesta) {
      throw new NotFoundException('Propuesta no encontrada o no te pertenece.');
    }

    if (propuesta.estado !== EstadoPropuesta.PENDIENTE) {
      throw new BadRequestException('No se puede eliminar una propuesta que ya ha sido respondida.');
    }

    await this.repositorio_propuesta.remove(propuesta);
    return { message: 'Propuesta eliminada.' };
  }
}