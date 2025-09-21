import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UsuariosService } from './usuarios.servicio';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Usuario } from './entidades/usuario.entidad';

@ApiTags('usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly servicio_usuarios: UsuariosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'El usuario fue creado exitosamente.', type: Usuario })
  @ApiResponse({ status: 400, description: 'Datos inválidos o el correo ya está en uso.' })
  crear(@Body() crear_usuario_dto: CrearUsuarioDto) {
    return this.servicio_usuarios.crear(crear_usuario_dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener una lista de todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios.', type: [Usuario] })
  obtenerTodos() {
    return this.servicio_usuarios.obtenerTodos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por su ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado.', type: Usuario })
  @ApiResponse({ status: 404, description: 'El usuario con el ID especificado no fue encontrado.' })
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicio_usuarios.obtenerUno(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario existente' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente.', type: Usuario })
  @ApiResponse({ status: 404, description: 'El usuario con el ID especificado no fue encontrado.' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizar_usuario_dto: ActualizarUsuarioDto) {
    return this.servicio_usuarios.actualizar(id, actualizar_usuario_dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'El usuario con el ID especificado no fue encontrado.' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio_usuarios.eliminar(id);
  }
}