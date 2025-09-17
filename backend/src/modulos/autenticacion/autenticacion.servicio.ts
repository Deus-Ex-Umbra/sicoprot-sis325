import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.servicio';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';
import { RegistroDto } from './dto/registro.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AutenticacionService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async iniciarSesion(iniciarSesionDto: IniciarSesionDto) {
    const { correo, contrasena } = iniciarSesionDto;
    const usuario = await this.usuariosService.buscarPorCorreo(correo);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const esContrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esContrasenaValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { contrasena: _, ...datosUsuario } = usuario;

    return {
      message: 'Inicio de sesión exitoso',
      usuario: datosUsuario,
    };
  }

  async registrarse(registroDto: RegistroDto) {
    return this.usuariosService.crear(registroDto);
  }

  cerrarSesion() {
    return { message: 'Sesión cerrada exitosamente.' };
  }
}