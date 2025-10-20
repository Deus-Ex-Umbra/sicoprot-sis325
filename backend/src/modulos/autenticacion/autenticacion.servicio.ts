import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.servicio';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entidades/usuario.entidad';
import { Repository } from 'typeorm';
import { Rol } from '../usuarios/enums/rol.enum';
import { EstadoUsuario } from '../usuarios/enums/estado-usuario.enum';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { JwtService } from '@nestjs/jwt';

export interface Perfil {
  id_estudiante?: number;
  id_asesor?: number;
  nombre: string;
  apellido: string;
}

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly servicio_usuarios: UsuariosService,
    @InjectRepository(Usuario)
    private readonly repositorio_usuario: Repository<Usuario>,
    @InjectRepository(Estudiante)
    private readonly repositorio_estudiante: Repository<Estudiante>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
    private readonly jwt_service: JwtService,
  ) {}

  async iniciarSesion(iniciar_sesion_dto: IniciarSesionDto) {
    const { correo, contrasena } = iniciar_sesion_dto;
    const usuario = await this.servicio_usuarios.buscarPorCorreo(correo);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (usuario.estado === EstadoUsuario.Pendiente) {
      throw new UnauthorizedException('Tu cuenta aún no ha sido aprobada por un administrador.');
    }

    if (usuario.estado === EstadoUsuario.Inactivo) {
      throw new UnauthorizedException('Tu cuenta ha sido desactivada. Contacta al administrador.');
    }

    if (usuario.estado === EstadoUsuario.Eliminado) {
      throw new UnauthorizedException('Tu cuenta ha sido eliminada.');
    }

    const es_contrasena_valida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!es_contrasena_valida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { 
      sub: usuario.id, 
      correo: usuario.correo, 
      rol: usuario.rol 
    };

    const token_acceso = await this.jwt_service.signAsync(payload);

    const { contrasena: _, ...datos_usuario } = usuario;

    let perfil_completo: Perfil | null = null;
    if (usuario.rol === Rol.Estudiante) {
      const estudiante = await this.repositorio_estudiante.findOne({
        where: { usuario: { id: usuario.id } },
      });
      if (estudiante) {
        perfil_completo = {
          id_estudiante: estudiante.id,
          nombre: estudiante.nombre,
          apellido: estudiante.apellido,
        };
      }
    } else if (usuario.rol === Rol.Asesor) {
      const asesor = await this.repositorio_asesor.findOne({
        where: { usuario: { id: usuario.id } },
      });
      if (asesor) {
        perfil_completo = {
          id_asesor: asesor.id,
          nombre: asesor.nombre,
          apellido: asesor.apellido,
        };
      }
    }

    return {
      message: 'Inicio de sesión exitoso',
      token_acceso,
      usuario: {
        ...datos_usuario,
        perfil: perfil_completo,
      },
    };
  }

  cerrarSesion() {
    return { message: 'Sesión cerrada exitosamente.' };
  }
}