import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudRegistro, EstadoSolicitud } from './entidades/solicitud-registro.entidad';
import { Usuario } from '../usuarios/entidades/usuario.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { CrearSolicitudDto } from './dto/crear-solicitud.dto';
import { ResponderSolicitudDto } from './dto/responder-solicitud.dto';
import { Rol } from '../usuarios/enums/rol.enum';
import { EstadoUsuario } from '../usuarios/enums/estado-usuario.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SolicitudesRegistroService {
  constructor(
    @InjectRepository(SolicitudRegistro)
    private readonly repositorio_solicitud: Repository<SolicitudRegistro>,
    @InjectRepository(Usuario)
    private readonly repositorio_usuario: Repository<Usuario>,
    @InjectRepository(Estudiante)
    private readonly repositorio_estudiante: Repository<Estudiante>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
  ) {}

  async crear(crear_solicitud_dto: CrearSolicitudDto) {
    const existe = await this.repositorio_solicitud.findOne({
      where: { correo: crear_solicitud_dto.correo },
    });

    if (existe) {
      throw new BadRequestException('Ya existe una solicitud con este correo.');
    }

    const usuario_existe = await this.repositorio_usuario.findOne({
      where: { correo: crear_solicitud_dto.correo },
    });

    if (usuario_existe) {
      throw new BadRequestException('El correo ya está registrado.');
    }

    const contrasena_hasheada = await bcrypt.hash(crear_solicitud_dto.contrasena, 10);

    const nueva_solicitud = this.repositorio_solicitud.create({
      ...crear_solicitud_dto,
      contrasena: contrasena_hasheada,
    });

    return this.repositorio_solicitud.save(nueva_solicitud);
  }

  async obtenerTodas() {
    return this.repositorio_solicitud.find({
      order: { fecha_solicitud: 'DESC' },
    });
  }

  async obtenerPendientes() {
    return this.repositorio_solicitud.find({
      where: { estado: EstadoSolicitud.Pendiente },
      order: { fecha_solicitud: 'DESC' },
    });
  }

  async obtenerUna(id: number) {
    const solicitud = await this.repositorio_solicitud.findOneBy({ id });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID '${id}' no encontrada.`);
    }

    return solicitud;
  }

  async responder(id: number, responder_solicitud_dto: ResponderSolicitudDto) {
    const solicitud = await this.repositorio_solicitud.findOneBy({ id });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID '${id}' no encontrada.`);
    }

    if (solicitud.estado !== EstadoSolicitud.Pendiente) {
      throw new BadRequestException('Esta solicitud ya ha sido procesada.');
    }

    if (responder_solicitud_dto.estado === 'aprobada') {
      const nuevo_usuario = this.repositorio_usuario.create({
        correo: solicitud.correo,
        rol: solicitud.rol,
        contrasena: solicitud.contrasena,
        estado: EstadoUsuario.Activo,
        fecha_aprobacion: new Date(),
      });

      const usuario_guardado = await this.repositorio_usuario.save(nuevo_usuario);

      if (solicitud.rol === Rol.Estudiante) {
        const nuevo_estudiante = this.repositorio_estudiante.create({
          nombre: solicitud.nombre,
          apellido: solicitud.apellido,
          usuario: usuario_guardado,
        });
        await this.repositorio_estudiante.save(nuevo_estudiante);
      } else if (solicitud.rol === Rol.Asesor) {
        const nuevo_asesor = this.repositorio_asesor.create({
          nombre: solicitud.nombre,
          apellido: solicitud.apellido,
          usuario: usuario_guardado,
        });
        await this.repositorio_asesor.save(nuevo_asesor);
      }

      solicitud.estado = EstadoSolicitud.Aprobada;
    } else {
      solicitud.estado = EstadoSolicitud.Rechazada;
    }

    if (responder_solicitud_dto.comentarios_admin) {
      solicitud.comentarios_admin = responder_solicitud_dto.comentarios_admin;
    }
    
    solicitud.fecha_respuesta = new Date();

    return this.repositorio_solicitud.save(solicitud);
  }

  async eliminar(id: number) {
    const solicitud = await this.repositorio_solicitud.findOneBy({ id });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID '${id}' no encontrada.`);
    }

    await this.repositorio_solicitud.remove(solicitud);
    return { message: `Solicitud con ID '${id}' eliminada exitosamente.` };
  }
}