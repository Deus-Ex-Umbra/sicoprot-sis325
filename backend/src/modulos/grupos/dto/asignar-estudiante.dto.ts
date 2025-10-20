import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AsignarEstudianteDto {
  @ApiProperty({ description: 'ID del estudiante', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id_estudiante: number;
}