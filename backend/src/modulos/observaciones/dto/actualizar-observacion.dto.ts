import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Matches,
} from 'class-validator';
import { EstadoObservacion } from '../enums/estado-observacion.enum';
import { ApiProperty } from '@nestjs/swagger';

export class ActualizarObservacionDto {
  @ApiProperty({
    description: 'Nuevo estado de la observación',
    enum: EstadoObservacion,
    example: EstadoObservacion.CORREGIDA,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoObservacion)
  estado?: EstadoObservacion;

  @ApiProperty({
    description:
      'Comentario opcional en HTML del asesor para guiar al estudiante',
    example:
      '<p>Revisar la <b>redacción</b> de la conclusión y <i>ajustar</i> las referencias APA.</p>',
    required: false,
  })
  @IsOptional()
  @IsString()
  comentarios_asesor_html?: string;

  @ApiProperty({ example: 'Error corregido', required: false })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiProperty({
    example: '<p>Revisar nuevamente la <b>redacción</b></p>',
    required: false,
  })
  @IsOptional()
  @IsString()
  contenido_html?: string;

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
  
  @ApiProperty({
    description: 'Color en formato hexadecimal',
    example: '#FFD700',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'El color debe estar en formato hexadecimal #RRGGBB',
  })
  color?: string;
}