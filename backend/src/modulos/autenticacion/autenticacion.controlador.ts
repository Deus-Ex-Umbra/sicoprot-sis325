import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.servicio';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('autenticacion')
@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly servicio_autenticacion: AutenticacionService) {}

  @Post('iniciar-sesion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión en el sistema' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  iniciarSesion(@Body() iniciar_sesion_dto: IniciarSesionDto) {
    return this.servicio_autenticacion.iniciarSesion(iniciar_sesion_dto);
  }

  @Post('cerrar-sesion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar la sesión del usuario' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente.' })
  cerrarSesion() {
    return this.servicio_autenticacion.cerrarSesion();
  }
}