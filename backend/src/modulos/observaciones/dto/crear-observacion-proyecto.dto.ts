import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearObservacionProyectoDto {
  @ApiProperty({ example: 'Revisión General Taller II' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: '<p>El avance general es bueno...</p>' })
  @IsString()
  @IsNotEmpty()
  contenido_html: string;

  @ApiProperty({ example: 'Avance general bueno', required: false })
  @IsOptional()
  @IsString()
  descripcion_corta?: string;
}