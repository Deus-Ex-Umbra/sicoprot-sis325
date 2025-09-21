import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearCorreccionDto {
  @ApiProperty({ example: 'Tipeo corregido' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: 'He corregido la ortografía y mejorado la redacción del párrafo.' })
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

  @ApiProperty({ example: 5, description: 'ID de la observación a la que responde esta corrección' })
  @IsNumber()
  @IsNotEmpty()
  id_observacion: number;

  @ApiProperty({ example: 3, description: 'ID del documento donde se realiza la corrección' })
  @IsNumber()
  @IsNotEmpty()
  id_documento: number;
}