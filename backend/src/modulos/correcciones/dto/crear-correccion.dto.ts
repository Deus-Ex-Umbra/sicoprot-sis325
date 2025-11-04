import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearCorreccionDto {
  @ApiProperty({
    description:
      'ID de la observación a la que responde esta corrección',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'El ID de la observación es obligatorio' })
  id_observacion: number;

  @ApiProperty({
    description:
      'Descripción detallada en HTML de la corrección realizada por el estudiante',
    example:
      '<p>Se <b>corrigió</b> la redacción del capítulo 2 y se <i>ajustaron</i> las referencias.</p>',
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  descripcion_html: string;

  @ApiProperty({
    description:
      'Número de versión del documento donde se realizó la corrección',
    example: 2,
  })
  @IsNumber()
  @Min(1, { message: 'La versión debe ser al menos 1' })
  version_corregida: number;

  @ApiProperty({
    description: 'Coordenada X inicial en el PDF',
    example: 10.5,
  })
  @IsNumber()
  @Min(0)
  x_inicio: number;

  @ApiProperty({
    description: 'Coordenada Y inicial en el PDF',
    example: 20.3,
  })
  @IsNumber()
  @Min(0)
  y_inicio: number;

  @ApiProperty({
    description: 'Coordenada X final en el PDF',
    example: 150.8,
  })
  @IsNumber()
  @Min(0)
  x_fin: number;

  @ApiProperty({
    description: 'Coordenada Y final en el PDF',
    example: 45.2,
  })
  @IsNumber()
  @Min(0)
  y_fin: number;

  @ApiProperty({
    description: 'Página inicial donde comienza la corrección',
    example: 2,
  })
  @IsNumber()
  @Min(1)
  pagina_inicio: number;

  @ApiProperty({
    description: 'Página final donde termina la corrección',
    example: 2,
  })
  @IsNumber()
  @Min(1)
  pagina_fin: number;

  @ApiProperty({
    description: 'Título breve de la corrección (opcional)',
    example: 'Corrección de referencias bibliográficas',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titulo?: string;

  @ApiProperty({
    description: 'Color en formato hexadecimal para resaltar en el PDF',
    example: '#28a745',
    default: '#28a745',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'El color debe estar en formato hexadecimal #RRGGBB (ejemplo: #28a745)',
  })
  color?: string;
}