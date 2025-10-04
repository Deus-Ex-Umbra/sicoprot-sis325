import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearCorreccionDto {
  @ApiProperty({ example: 'Error corregido', required: false })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiProperty({ example: 'Se corrigió la redacción del capítulo 2.' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

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

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id_observacion: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id_documento: number;

  @ApiProperty({ example: '#28a745', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'El color debe estar en formato hexadecimal #RRGGBB' })
  color?: string;
}