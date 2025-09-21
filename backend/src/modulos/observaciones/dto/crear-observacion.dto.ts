import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearObservacionDto {
  @ApiProperty({ example: 'Error de tipeo en la introducción' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: 'Revisar la ortografía del capítulo 2.' })
  @IsString()
  @IsNotEmpty()
  contenido: string;

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
}