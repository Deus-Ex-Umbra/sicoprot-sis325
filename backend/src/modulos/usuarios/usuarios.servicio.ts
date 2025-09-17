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
    private readonly usuarioRepositorio: Repository<Usuario>,
  ) {}

  async crear(crearUsuarioDto: CrearUsuarioDto) {
    try {
      const { contrasena, ...datosUsuario } = crearUsuarioDto;
      const nuevoUsuario = this.usuarioRepositorio.create({
        ...datosUsuario,
        contrasena: await bcrypt.hash(contrasena, 10),
      });

      await this.usuarioRepositorio.save(nuevoUsuario);

      // --- CORRECCIÓN AQUÍ ---
      // Renombramos la variable 'contrasena' que se descarta a '_' para evitar el conflicto.
      const { contrasena: _, ...usuarioParaRetornar } = nuevoUsuario;
      return usuarioParaRetornar;

    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('El correo ya está en uso.');
      }
      throw error;
    }
  }

  async obtenerTodos(): Promise<Usuario[]> {
    return this.usuarioRepositorio.find();
  }

  async obtenerUno(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepositorio.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado.`);
    }
    return usuario;
  }

  async buscarPorCorreo(correo: string): Promise<Usuario | undefined> {
    const usuario = await this.usuarioRepositorio
    .createQueryBuilder('usuario')
    .addSelect('usuario.contrasena')
    .where('usuario.correo = :correo', { correo })
    .getOne();
    return usuario || undefined;
  }

  async actualizar(id: string, actualizarUsuarioDto: ActualizarUsuarioDto) {
    if (actualizarUsuarioDto.contrasena) {
      actualizarUsuarioDto.contrasena = await bcrypt.hash(
        actualizarUsuarioDto.contrasena,
        10,
      );
    }
    const usuario = await this.usuarioRepositorio.preload({
      id: id,
      ...actualizarUsuarioDto,
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado.`);
    }
    const usuarioActualizado = await this.usuarioRepositorio.save(usuario);
    const { contrasena: _, ...usuarioParaRetornar } = usuarioActualizado;
    return usuarioParaRetornar;
  }

  async eliminar(id: string) {
    const resultado = await this.usuarioRepositorio.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado.`);
    }
    return { message: `Usuario con ID '${id}' eliminado.` };
  }
}