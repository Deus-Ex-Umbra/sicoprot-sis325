import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.servicio';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';
import { RegistroDto } from './dto/registro.dto';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('iniciar-sesion')
  @HttpCode(HttpStatus.OK)
  iniciarSesion(@Body() iniciarSesionDto: IniciarSesionDto) {
    return this.autenticacionService.iniciarSesion(iniciarSesionDto);
  }

  @Post('registrarse')
  registrarse(@Body() registroDto: RegistroDto) {
    return this.autenticacionService.registrarse(registroDto);
  }

  @Post('cerrar-sesion')
  @HttpCode(HttpStatus.OK)
  cerrarSesion() {
    return this.autenticacionService.cerrarSesion();
  }
}