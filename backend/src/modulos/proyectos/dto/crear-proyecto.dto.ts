import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearProyectoDto {
  @ApiProperty({ description: 'Título del proyecto de tesis', example: 'Desarrollo de un sistema de gestión académica' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ description: 'ID del asesor asignado al proyecto (opcional si el estudiante tiene grupo)', example: 2, required: false })
  @IsNumber()
  @IsOptional()
  id_asesor?: number;
}