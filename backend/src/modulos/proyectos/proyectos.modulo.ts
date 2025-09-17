import { Module } from '@nestjs/common';
import { ProyectosService } from './proyectos.servicio';
import { ProyectosController } from './proyectos.controlador';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from './entidades/proyecto.endidad';
import { UsuariosModule } from '../usuarios/usuarios.modulo';

@Module({
  imports: [TypeOrmModule.forFeature([Proyecto]), UsuariosModule],
  controllers: [ProyectosController],
  providers: [ProyectosService],
  exports: [TypeOrmModule],
})
export class ProyectosModule {}