import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entidades/usuario.entidad';
import { Rol } from '../usuarios/enums/rol.enum';
import { EstadoUsuario } from '../usuarios/enums/estado-usuario.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SemillaService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario)
    private readonly repositorio_usuario: Repository<Usuario>,
  ) {}

  async onModuleInit() {
    await this.crearAdministradorPorDefecto();
  }

  private async crearAdministradorPorDefecto() {
    const admin_existe = await this.repositorio_usuario.findOne({
      where: { rol: Rol.Administrador },
    });

    if (!admin_existe) {
      const admin = this.repositorio_usuario.create({
        correo: 'admin@test.com',
        contrasena: await bcrypt.hash('Admin1234', 10),
        rol: Rol.Administrador,
        estado: EstadoUsuario.Activo,
        fecha_aprobacion: new Date(),
      });

      await this.repositorio_usuario.save(admin);
      console.log('✓ Administrador por defecto creado: admin@test.com / Admin1234');
    }
  }
}