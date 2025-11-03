import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearPropuestaTemaDto {
  @ApiProperty({
    description: 'Título de la propuesta de tema',
    example: 'Nuevo sistema de IA',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({
    description: 'Cuerpo de la propuesta en formato HTML',
    example: '<p>Esta propuesta trata sobre...</p>',
  })
  @IsString()
  @IsNotEmpty()
  cuerpo_html: string;

  @ApiProperty({
    description: 'ID del proyecto al que se asocia esta propuesta',
    example: 1,
  })
  @IsNumber()
  id_proyecto: number;
}