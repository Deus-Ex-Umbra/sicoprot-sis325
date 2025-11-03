import { IsOptional, IsString, IsNumber, Min, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActualizarCorreccionDto {
  @ApiProperty({
    description: 'Nuevo título de la corrección',
    example: 'Corrección actualizada del marco teórico',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titulo?: string;

  @ApiProperty({
    description: 'Nueva descripción HTML de la corrección',
    example: '<p>Se realizaron <b>ajustes</b> adicionales.</p>',
    required: false,
  })
  @IsOptional()
  @IsString()
  descripcion_html?: string;

  @ApiProperty({
    description: 'Nueva versión corregida',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  version_corregida?: number;

  @ApiProperty({
    description: 'Nueva coordenada X inicial',
    example: 10.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  x_inicio?: number;

  @ApiProperty({
    description: 'Nueva coordenada Y inicial',
    example: 20.3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  y_inicio?: number;

  @ApiProperty({
    description: 'Nueva coordenada X final',
    example: 150.8,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  x_fin?: number;

  @ApiProperty({
    description: 'Nueva coordenada Y final',
    example: 45.2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  y_fin?: number;

  @ApiProperty({
    description: 'Nueva página inicial',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pagina_inicio?: number;

  @ApiProperty({
    description: 'Nueva página final',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pagina_fin?: number;

  @ApiProperty({
    description: 'Nuevo color en formato hexadecimal',
    example: '#007bff',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'El color debe estar en formato hexadecimal #RRGGBB',
  })
  color?: string;
}