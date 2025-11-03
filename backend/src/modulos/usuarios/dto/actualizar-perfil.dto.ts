import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActualizarPerfilDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  correo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  apellido?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ruta_foto?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(8)
  contrasena_actual?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(8)
  contrasena_nueva?: string;
}