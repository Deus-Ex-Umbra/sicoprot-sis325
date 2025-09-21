import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Rol } from '../enums/rol.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CrearUsuarioDto {
  @ApiProperty({
    description: 'Correo electrónico único del usuario',
    example: 'juan.perez@email.com',
  })
  @IsEmail({}, { message: 'El formato del correo no es válido.' })
  @IsNotEmpty({ message: 'El correo es requerido.' })
  correo: string;

  @ApiProperty({
    description: 'Contraseña del usuario, mínimo 8 caracteres',
    example: 'passwordSeguro123',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @IsNotEmpty({ message: 'La contraseña es requerida.' })
  contrasena: string;

  @ApiProperty({
    description: 'Rol del usuario dentro del sistema',
    enum: Rol,
    example: Rol.Estudiante,
  })
  @IsEnum(Rol, { message: 'El rol proporcionado no es válido.' })
  @IsNotEmpty({ message: 'El rol es requerido.' })
  rol: Rol;

  @ApiProperty({
    description: 'Nombre(s) del usuario',
    example: 'Juan Carlos',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido.' })
  nombre: string;

  @ApiProperty({
    description: 'Apellido(s) del usuario',
    example: 'Perez Gonzales',
  })
  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido.' })
  apellido: string;
}