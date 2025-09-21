import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IniciarSesionDto {
  @ApiProperty({
    description: 'Correo electrónico para iniciar sesión',
    example: 'juan.perez@email.com',
  })
  @IsEmail({}, { message: 'El correo no es válido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  correo: string;

  @ApiProperty({
    description: 'Contraseña de la cuenta',
    example: 'passwordSeguro123',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  contrasena: string;
}