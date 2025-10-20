import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Usuario } from '../usuarios/entidades/usuario.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { EstadoUsuario } from '../usuarios/enums/estado-usuario.enum';
import { Rol } from '../usuarios/enums/rol.enum';

@Injectable()
export class AdministracionService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repositorio_usuario: Repository<Usuario>,
    @InjectRepository(Estudiante)
    private readonly repositorio_estudiante: Repository<Estudiante>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
  ) {}

  async obtenerTodosUsuarios() {
    const usuarios = await this.repositorio_usuario.find({
      order: { creado_en: 'DESC' },
    });

    const usuarios_completos = await Promise.all(
      usuarios.map(async (usuario) => {
        let perfil: any = null;

        if (usuario.rol === Rol.Estudiante) {
          const estudiante = await this.repositorio_estudiante.findOne({
            where: { usuario: { id: usuario.id } },
            relations: ['grupo'],
          });
          if (estudiante) {
            perfil = {
              id_estudiante: estudiante.id,
              nombre: estudiante.nombre,
              apellido: estudiante.apellido,
              grupo: estudiante.grupo,
            };
          }
        } else if (usuario.rol === Rol.Asesor) {
          const asesor = await this.repositorio_asesor.findOne({
            where: { usuario: { id: usuario.id } },
            relations: ['grupos'],
          });
          if (asesor) {
            perfil = {
              id_asesor: asesor.id,
              nombre: asesor.nombre,
              apellido: asesor.apellido,
              grupos: asesor.grupos,
            };
          }
        }

        return {
          ...usuario,
          perfil,
        };
      }),
    );

    return usuarios_completos;
  }

  async obtenerEstudiantes() {
    return this.repositorio_estudiante.find({
      relations: ['usuario', 'grupo', 'grupo.asesor'],
    });
  }

  async obtenerEstudiantesSinGrupo() {
    return this.repositorio_estudiante.find({
      where: { grupo: IsNull() },
      relations: ['usuario'],
    });
  }

  async cambiarEstadoUsuario(id_usuario: number, nuevo_estado: EstadoUsuario) {
    const usuario = await this.repositorio_usuario.findOneBy({ id: id_usuario });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID '${id_usuario}' no encontrado.`);
    }

    if (usuario.rol === Rol.Administrador) {
      throw new BadRequestException('No se puede cambiar el estado de un administrador.');
    }

    usuario.estado = nuevo_estado;
    return this.repositorio_usuario.save(usuario);
  }

  async obtenerEstadisticas() {
    const total_usuarios = await this.repositorio_usuario.count();
    const usuarios_activos = await this.repositorio_usuario.count({
      where: { estado: EstadoUsuario.Activo },
    });
    const usuarios_pendientes = await this.repositorio_usuario.count({
      where: { estado: EstadoUsuario.Pendiente },
    });
    const total_estudiantes = await this.repositorio_estudiante.count();
    const total_asesores = await this.repositorio_asesor.count();
    const estudiantes_sin_grupo = await this.repositorio_estudiante.count({
      where: { grupo: IsNull() },
    });

    return {
      total_usuarios,
      usuarios_activos,
      usuarios_pendientes,
      total_estudiantes,
      total_asesores,
      estudiantes_sin_grupo,
    };
  }
}