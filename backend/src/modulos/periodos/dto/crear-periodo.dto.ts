import { IsNotEmpty, IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearPeriodoDto {
  @ApiProperty({ description: 'Nombre del período', example: '2025-1' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Descripción del período', example: 'Primer semestre 2025', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ description: 'Fecha de inicio del semestre', example: '2025-02-01' })
  @IsDateString()
  @IsNotEmpty()
  fecha_inicio_semestre: string;

  @ApiProperty({ description: 'Fecha de fin del semestre', example: '2025-06-30' })
  @IsDateString()
  @IsNotEmpty()
  fecha_fin_semestre: string;

  @ApiProperty({ description: 'Fecha de inicio de inscripciones', example: '2025-01-10' })
  @IsDateString()
  @IsNotEmpty()
  fecha_inicio_inscripciones: string;

  @ApiProperty({ description: 'Fecha de fin de inscripciones', example: '2025-01-31' })
  @IsDateString()
  @IsNotEmpty()
  fecha_fin_inscripciones: string;

  @ApiProperty({ description: 'Estado activo del período', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}