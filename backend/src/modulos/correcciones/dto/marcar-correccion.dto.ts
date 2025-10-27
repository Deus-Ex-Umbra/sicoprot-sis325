import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para marcar una corrección como completada
 * El estudiante actualiza la versión en la que realizó la corrección
 * 
 * USO: Cuando el estudiante sube una nueva versión del documento
 *      y quiere indicar en cuál versión corrigió la observación
 */
export class MarcarCorregidoDto {
  @ApiProperty({
    description: 'Número de versión del documento donde se realizó la corrección',
    example: 3,
  })
  @IsNumber()
  @Min(1, { message: 'La versión debe ser al menos 1' })
  version_corregida: number;

  @ApiProperty({
    description: 'Comentario opcional del estudiante sobre la corrección realizada',
    example: 'Corregí la ortografía, ajusté las referencias APA y expandí el marco teórico como solicitado.',
    required: false,
  })
  @IsOptional()
  @IsString()
  comentario?: string;
}