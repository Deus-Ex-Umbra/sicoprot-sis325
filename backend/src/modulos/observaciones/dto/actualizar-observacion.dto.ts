import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Min, Matches } from 'class-validator';
import { EstadoObservacion } from '../enums/estado-observacion.enum';
import { ApiProperty } from '@nestjs/swagger';

export class ActualizarObservacionDto {
  @ApiProperty({ example: 'Error corregido', required: false })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiProperty({ example: 'Revisar nuevamente la redacción', required: false })
  @IsOptional()
  @IsString()
  contenido?: string;

  @ApiProperty({ example: 10.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  x_inicio?: number;

  @ApiProperty({ example: 20.3, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  y_inicio?: number;

  @ApiProperty({ example: 150.8, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  x_fin?: number;

  @ApiProperty({ example: 45.2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  y_fin?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pagina_inicio?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pagina_fin?: number;

  @ApiProperty({ example: '#FFD700', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'El color debe estar en formato hexadecimal #RRGGBB' })
  color?: string;

  @ApiProperty({ example: EstadoObservacion.CORREGIDO, required: false })
  @IsOptional()
  @IsEnum(EstadoObservacion)
  estado?: EstadoObservacion;

  @ApiProperty({ example: 'Revisar la redacción', required: false })
  @IsOptional()
  @IsString()
  comentarios_asesor?: string;
}