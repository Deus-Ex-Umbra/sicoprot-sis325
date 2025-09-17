import { Module } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.servicio';
import { AutenticacionController } from './autenticacion.controlador';
import { UsuariosModule } from '../usuarios/usuarios.modulo';

@Module({
  imports: [UsuariosModule],
  controllers: [AutenticacionController],
  providers: [AutenticacionService],
})
export class AutenticacionModule {}