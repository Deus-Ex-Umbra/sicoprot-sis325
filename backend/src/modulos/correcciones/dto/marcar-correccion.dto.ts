import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarcarCorregidoDto {
  @ApiProperty({
    description:
      'Número de versión del documento donde se realizó la corrección',
    example: 3,
  })
  @IsNumber()
  @Min(1, { message: 'La versión debe ser al menos 1' })
  version_corregida: number;

  @ApiProperty({
    description:
      'Comentario opcional en HTML del estudiante sobre la corrección realizada',
    example:
      '<p>Corregí la ortografía y <b>expandí</b> el marco teórico.</p>',
    required: false,
  })
  @IsOptional()
  @IsString()
  comentario_html?: string;
}