import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearObservacionDto {
  @ApiProperty({ example: 'Error de tipeo en la introducción' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: '<p>Revisar la <b>ortografía</b> del capítulo 2.</p>' })
  @IsString()
  @IsNotEmpty()
  contenido_html: string;

  @ApiProperty({ example: 10.5 })
  @IsNumber()
  @Min(0)
  x_inicio: number;

  @ApiProperty({ example: 20.3 })
  @IsNumber()
  @Min(0)
  y_inicio: number;

  @ApiProperty({ example: 150.8 })
  @IsNumber()
  @Min(0)
  x_fin: number;

  @ApiProperty({ example: 45.2 })
  @IsNumber()
  @Min(0)
  y_fin: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  pagina_inicio: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  pagina_fin: number;

  @ApiProperty({ example: 'Revisar ortografía cap 2.', required: false })
  @IsOptional()
  @IsString()
  descripcion_corta?: string;
}