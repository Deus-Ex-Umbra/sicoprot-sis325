import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entidades/usuario.entidad';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Rol } from './enums/rol.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repositorio_usuario: Repository<Usuario>,
    @InjectRepository(Estudiante)
    private readonly repositorio_estudiante: Repository<Estudiante>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
  ) {}

  async crear(crear_usuario_dto: CrearUsuarioDto) {
    try {
      const { contrasena, ...datos_usuario } = crear_usuario_dto;
      const nuevo_usuario = this.repositorio_usuario.create({
        ...datos_usuario,
        contrasena: await bcrypt.hash(contrasena, 10),
      });

      await this.repositorio_usuario.save(nuevo_usuario);

      const { contrasena: _, ...usuario_para_retornar } = nuevo_usuario;
      return usuario_para_retornar;

    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('El correo ya está en uso.');
      }
      throw error;
    }
  }

  async obtenerTodos(): Promise<Usuario[]> {
    return this.repositorio_usuario.find();
  }

  async obtenerUno(id: number): Promise<Usuario> {
    const usuario = await this.repositorio_usuario.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado.`);
    }
    return usuario;
  }

  async buscarPorCorreo(correo: string): Promise<Usuario | undefined> {
    const usuario = await this.repositorio_usuario
    .createQueryBuilder('usuario')
    .addSelect('usuario.contrasena')
    .where('usuario.correo = :correo', { correo })
    .getOne();
    return usuario || undefined;
  }

  async actualizar(id: number, actualizar_usuario_dto: ActualizarUsuarioDto) {
    if (actualizar_usuario_dto.contrasena) {
      actualizar_usuario_dto.contrasena = await bcrypt.hash(
        actualizar_usuario_dto.contrasena,
        10,
      );
    }
    const usuario = await this.repositorio_usuario.preload({
      id: id,
      ...actualizar_usuario_dto,
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado.`);
    }
    const usuario_actualizado = await this.repositorio_usuario.save(usuario);
    const { contrasena: _, ...usuario_para_retornar } = usuario_actualizado;
    return usuario_para_retornar;
  }

  async actualizarPerfil(id: number, actualizar_perfil_dto: ActualizarPerfilDto) {
    const usuario = await this.repositorio_usuario
      .createQueryBuilder('usuario')
      .addSelect('usuario.contrasena')
      .where('usuario.id = :id', { id })
      .getOne();

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado.`);
    }

    if (actualizar_perfil_dto.correo && actualizar_perfil_dto.correo !== usuario.correo) {
      const correo_existe = await this.repositorio_usuario.findOne({
        where: { correo: actualizar_perfil_dto.correo },
      });
      if (correo_existe) {
        throw new BadRequestException('El correo ya está en uso.');
      }
      usuario.correo = actualizar_perfil_dto.correo;
    }

    if (actualizar_perfil_dto.contrasena_nueva) {
      if (!actualizar_perfil_dto.contrasena_actual) {
        throw new BadRequestException('Debe proporcionar la contraseña actual.');
      }

      const contrasena_valida = await bcrypt.compare(
        actualizar_perfil_dto.contrasena_actual,
        usuario.contrasena,
      );

      if (!contrasena_valida) {
        throw new UnauthorizedException('La contraseña actual es incorrecta.');
      }

      usuario.contrasena = await bcrypt.hash(actualizar_perfil_dto.contrasena_nueva, 10);
    }

    if (actualizar_perfil_dto.nombre || actualizar_perfil_dto.apellido) {
      if (usuario.rol === Rol.Estudiante) {
        const estudiante = await this.repositorio_estudiante.findOne({
          where: { usuario: { id: usuario.id } },
        });
        if (estudiante) {
          if (actualizar_perfil_dto.nombre) estudiante.nombre = actualizar_perfil_dto.nombre;
          if (actualizar_perfil_dto.apellido) estudiante.apellido = actualizar_perfil_dto.apellido;
          await this.repositorio_estudiante.save(estudiante);
        }
      } else if (usuario.rol === Rol.Asesor) {
        const asesor = await this.repositorio_asesor.findOne({
          where: { usuario: { id: usuario.id } },
        });
        if (asesor) {
          if (actualizar_perfil_dto.nombre) asesor.nombre = actualizar_perfil_dto.nombre;
          if (actualizar_perfil_dto.apellido) asesor.apellido = actualizar_perfil_dto.apellido;
          await this.repositorio_asesor.save(asesor);
        }
      }
    }

    const usuario_actualizado = await this.repositorio_usuario.save(usuario);
    const { contrasena: _, ...usuario_para_retornar } = usuario_actualizado;

    let perfil: { id_estudiante: number; nombre: string; apellido: string; } | { id_asesor: number; nombre: string; apellido: string; } | null = null;
    if (usuario.rol === Rol.Estudiante) {
      const estudiante = await this.repositorio_estudiante.findOne({
        where: { usuario: { id: usuario.id } },
      });
      if (estudiante) {
        perfil = {
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
        perfil = {
          id_asesor: asesor.id,
          nombre: asesor.nombre,
          apellido: asesor.apellido,
        };
      }
    }

    return {
      ...usuario_para_retornar,
      perfil,
    };
  }

  async eliminar(id: number) {
    const resultado = await this.repositorio_usuario.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado.`);
    }
    return { message: `Usuario con ID '${id}' eliminado.` };
  }
}