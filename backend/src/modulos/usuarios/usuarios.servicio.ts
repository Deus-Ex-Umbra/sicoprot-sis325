import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entidades/usuario.entidad';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repositorio_usuario: Repository<Usuario>,
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

  async eliminar(id: number) {
    const resultado = await this.repositorio_usuario.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado.`);
    }
    return { message: `Usuario con ID '${id}' eliminado.` };
  }
}