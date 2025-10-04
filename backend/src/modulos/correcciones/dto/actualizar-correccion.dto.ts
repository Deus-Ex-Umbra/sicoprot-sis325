import { IsOptional, IsString, IsNumber, Min, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActualizarCorreccionDto {
  @ApiProperty({ example: 'Error corregido', required: false })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiProperty({ example: 'Se corrigió la redacción', required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

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

  @ApiProperty({ example: '#28a745', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'El color debe estar en formato hexadecimal #RRGGBB' })
  color?: string;
}