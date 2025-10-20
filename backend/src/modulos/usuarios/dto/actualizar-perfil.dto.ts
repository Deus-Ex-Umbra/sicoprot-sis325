import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActualizarPerfilDto {
  @ApiProperty({ description: 'Correo electrónico', example: 'nuevo@email.com', required: false })
  @IsEmail({}, { message: 'El formato del correo no es válido.' })
  @IsOptional()
  correo?: string;

  @ApiProperty({ description: 'Contraseña actual', example: 'password123', required: false })
  @IsString()
  @IsOptional()
  contrasena_actual?: string;

  @ApiProperty({ description: 'Nueva contraseña', example: 'newpassword456', required: false })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @IsOptional()
  contrasena_nueva?: string;

  @ApiProperty({ description: 'Nombre', example: 'Juan', required: false })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ description: 'Apellido', example: 'Pérez', required: false })
  @IsString()
  @IsOptional()
  apellido?: string;
}