import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.servicio';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';
import { RegistroDto } from './dto/registro.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entidades/usuario.entidad';
import { Repository } from 'typeorm';
import { Rol } from '../usuarios/enums/rol.enum';
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

  async registrarse(registro_dto: RegistroDto) {
    const { contrasena, rol, correo, nombre, apellido } = registro_dto;

    try {
      const nuevo_usuario = this.repositorio_usuario.create({
        correo,
        rol,
        contrasena: await bcrypt.hash(contrasena, 10),
      });

      const usuario_guardado = await this.repositorio_usuario.save(nuevo_usuario);

      let perfil_completo: Perfil | null = null;

      if (rol === Rol.Estudiante) {
        const nuevo_estudiante = this.repositorio_estudiante.create({
          nombre,
          apellido,
          usuario: usuario_guardado,
        });
        const estudiante_guardado = await this.repositorio_estudiante.save(nuevo_estudiante);
        perfil_completo = {
          id_estudiante: estudiante_guardado.id,
          nombre: estudiante_guardado.nombre,
          apellido: estudiante_guardado.apellido,
        };
      } else if (rol === Rol.Asesor) {
        const nuevo_asesor = this.repositorio_asesor.create({
          nombre,
          apellido,
          usuario: usuario_guardado,
        });
        const asesor_guardado = await this.repositorio_asesor.save(nuevo_asesor);
        perfil_completo = {
          id_asesor: asesor_guardado.id,
          nombre: asesor_guardado.nombre,
          apellido: asesor_guardado.apellido,
        };
      }

      const payload = { 
        sub: usuario_guardado.id, 
        correo: usuario_guardado.correo, 
        rol: usuario_guardado.rol 
      };

      const token_acceso = await this.jwt_service.signAsync(payload);

      const { contrasena: _, ...usuario_para_retornar } = usuario_guardado;
      
      return {
        message: 'Registro exitoso',
        token_acceso,
        usuario: {
          ...usuario_para_retornar,
          perfil: perfil_completo,
        },
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('El correo ya está en uso.');
      }
      throw error;
    }
  }

  cerrarSesion() {
    return { message: 'Sesión cerrada exitosamente.' };
  }
}