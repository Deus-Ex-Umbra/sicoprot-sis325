import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Rol } from '../../usuarios/enums/rol.enum';
import { ApiProperty } from '@nestjs/swagger';

export class RegistroDto {
  @ApiProperty({ description: 'Correo electrónico único del nuevo usuario', example: 'nuevo.usuario@email.com' })
  @IsEmail({}, { message: 'El formato del correo no es válido.' })
  @IsNotEmpty({ message: 'El correo es requerido.' })
  correo: string;

  @ApiProperty({ description: 'Contraseña para el nuevo usuario, mínimo 8 caracteres', example: 'miContrasenaFuerte456' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @IsNotEmpty({ message: 'La contraseña es requerida.' })
  contrasena: string;

  @ApiProperty({ description: 'Rol del nuevo usuario', enum: Rol, example: Rol.Estudiante })
  @IsEnum(Rol, { message: 'El rol proporcionado no es válido.' })
  @IsNotEmpty({ message: 'El rol es requerido.' })
  rol: Rol;

  @ApiProperty({ description: 'Nombre(s) del nuevo usuario', example: 'Ana' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido.' })
  nombre: string;

  @ApiProperty({ description: 'Apellido(s) del nuevo usuario', example: 'García' })
  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido.' })
  apellido: string;
}