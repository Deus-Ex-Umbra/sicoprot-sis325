import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoGrupo } from '../enums/tipo-grupo.enum';

export class ActualizarGrupoDto {
  @ApiProperty({ description: 'Nombre del grupo', example: 'Grupo A - Ing. Software', required: false })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ description: 'Descripción del grupo', example: 'Grupo de tesis de Ingeniería de Software', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ description: 'ID del asesor asignado', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  id_asesor?: number;

  @ApiProperty({ description: 'ID del período', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  id_periodo?: number;

  @ApiProperty({ description: 'Estado activo del grupo', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @ApiProperty({ description: 'Tipo de grupo (Taller I o II)', enum: TipoGrupo, example: TipoGrupo.TALLER_GRADO_I, required: false })
  @IsEnum(TipoGrupo)
  @IsOptional()
  tipo?: TipoGrupo;

  @ApiProperty({ description: 'Carrera asociada al grupo', example: 'Ingeniería de Software', required: false })
  @IsString()
  @IsOptional()
  carrera?: string;

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
  @IsOptional()
  dias_revision_asesor?: number;

  @ApiProperty({ description: 'Días que el estudiante tiene para corregir', example: 14, required: false, default: 14 })
  @IsNumber()
  @IsOptional()
  dias_correccion_estudiante?: number;
}