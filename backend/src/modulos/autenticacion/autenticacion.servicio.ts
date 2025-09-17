import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsuariosService } from '../usuarios/usuarios.servicio';

@Injectable()
export class AutenticacionService {
  constructor(private readonly usuariosService: UsuariosService) {}

  iniciarSesion(loginDto: LoginDto) {
    return {
      message: 'Inicio de sesión exitoso',
      usuario: loginDto.correo,
    };
  }
}