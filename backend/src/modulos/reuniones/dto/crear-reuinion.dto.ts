import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearReunionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty()
  @IsDateString()
  fecha_programada: string;

  @ApiProperty()
  @IsNumber()
  id_proyecto: number;
}