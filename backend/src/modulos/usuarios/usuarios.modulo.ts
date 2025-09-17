import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.servicio';
import { UsuariosController } from './usuarios.controlador';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}