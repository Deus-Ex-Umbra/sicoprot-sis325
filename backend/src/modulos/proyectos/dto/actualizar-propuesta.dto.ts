import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActualizarPropuestaDto {
  @ApiProperty({
    description: 'Nuevo título del proyecto',
    example: 'Título de propuesta actualizado',
    required: false,
  })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({
    description: 'Nueva descripción detallada de la propuesta en HTML',
    example: '<p>Contenido actualizado...</p>',
    required: false,
  })
  @IsString()
  @IsOptional()
  cuerpo_html?: string;
}