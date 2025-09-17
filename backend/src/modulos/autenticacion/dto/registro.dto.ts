import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Rol } from '../../usuarios/enums/rol.enum';

export class RegistroDto {
  @IsEmail({}, { message: 'El formato del correo no es válido.' })
  @IsNotEmpty({ message: 'El correo es requerido.' })
  correo: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @IsNotEmpty({ message: 'La contraseña es requerida.' })
  contrasena: string;

  @IsEnum(Rol, { message: 'El rol proporcionado no es válido.' })
  @IsNotEmpty({ message: 'El rol es requerido.' })
  rol: Rol;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido.' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido.' })
  apellido: string;
}