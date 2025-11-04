import { IsNotEmpty, IsString, IsDateString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
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

  @ApiProperty({ description: 'Fecha límite para la propuesta', example: '2025-03-15', required: false })
  @IsDateString()
  @IsOptional()
  fecha_limite_propuesta?: string;

  @ApiProperty({ description: 'Fecha límite para el perfil', example: '2025-05-15', required: false })
  @IsDateString()
  @IsOptional()
  fecha_limite_perfil?: string;

  @ApiProperty({ description: 'Fecha límite para el proyecto final', example: '2025-06-15', required: false })
  @IsDateString()
  @IsOptional()
  fecha_limite_proyecto?: string;

  @ApiProperty({ description: 'Días que el asesor tiene para revisar', example: 7, required: false, default: 7 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  dias_revision_asesor?: number;

  @ApiProperty({ description: 'Días que el estudiante tiene para corregir', example: 14, required: false, default: 14 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  dias_correccion_estudiante?: number;
}