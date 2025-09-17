import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class IniciarSesionDto {
  @IsEmail({}, { message: 'El correo no es válido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  correo: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  contrasena: string;
}