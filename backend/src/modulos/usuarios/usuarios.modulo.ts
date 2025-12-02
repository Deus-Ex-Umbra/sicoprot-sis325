import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.servicio';
import { UsuarioAdminController, UsuariosController } from './usuarios.controlador';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entidades/usuario.entidad';
import { EstudiantesModule } from '../estudiantes/estudiantes.modulo';
import { AsesoresModule } from '../asesores/asesores.modulo';
@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    EstudiantesModule,
    AsesoresModule,
  ],
  controllers: [UsuariosController,UsuarioAdminController],
  providers: [UsuariosService],
  exports: [UsuariosService, TypeOrmModule],
})
export class UsuariosModule {}