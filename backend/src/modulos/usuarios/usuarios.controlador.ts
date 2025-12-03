import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UsuariosService } from './usuarios.servicio';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Usuario } from './entidades/usuario.entidad';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';
import { BadRequestException } from '@nestjs/common';

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

  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('perfil/actual')
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario.' })
  obtenerPerfilActual(@Request() req) {
    return this.servicio_usuarios.obtenerPerfilCompleto(req.user.id_usuario);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch('perfil/actualizar')
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado (datos de texto)' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente.' })
  actualizarPerfil(@Request() req, @Body() actualizar_perfil_dto: ActualizarPerfilDto) {
    return this.servicio_usuarios.actualizarPerfil(req.user.id_usuario, actualizar_perfil_dto);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch('perfil/actualizar-foto')
  @ApiOperation({ summary: 'Actualizar foto de perfil del usuario autenticado' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Foto de perfil a subir',
    schema: {
      type: 'object',
      properties: {
        foto: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Foto de perfil actualizada.' })
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/perfiles',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = file.originalname.split('.').pop();
          cb(null, `perfil-${uniqueSuffix}.${extension}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Solo se permiten archivos de imagen (jpg, jpeg, png, gif)'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      }
    }),
  )
  actualizarFotoPerfil(@Request() req, @UploadedFile() foto: Express.Multer.File) {
    if (!foto) {
      throw new BadRequestException('No se proporcionó ningún archivo de imagen.');
    }
    const ruta_archivo = `uploads/perfiles/${foto.filename}`;
    return this.servicio_usuarios.actualizarFoto(req.user.id_usuario, ruta_archivo);
  }


  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'El usuario con el ID especificado no fue encontrado.' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio_usuarios.eliminar(id);
  }
}