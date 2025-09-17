import { Injectable } from '@nestjs/common';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

@Injectable()
export class UsuariosService {
  crear(crearUsuarioDto: CrearUsuarioDto) {
    return 'This action adds a new usuario';
  }

  obtenerTodos() {
    return `This action returns all usuarios`;
  }

  obtenerUno(id: string) {
    return `This action returns a #${id} usuario`;
  }

  actualizar(id: string, actualizarUsuarioDto: ActualizarUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  eliminar(id: string) {
    return `This action removes a #${id} usuario`;
  }
}