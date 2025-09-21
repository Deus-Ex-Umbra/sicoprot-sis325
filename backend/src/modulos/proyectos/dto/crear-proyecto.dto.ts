import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearProyectoDto {
  @ApiProperty({ description: 'Título del proyecto de tesis', example: 'Desarrollo de un sistema de gestión académica' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ description: 'ID del asesor asignado al proyecto', example: 2 })
  @IsNumber()
  @IsNotEmpty()
  id_asesor: number;
}