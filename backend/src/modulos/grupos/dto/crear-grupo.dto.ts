import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoGrupo } from '../enums/tipo-grupo.enum';

export class CrearGrupoDto {
  @ApiProperty({ description: 'Nombre del grupo', example: 'Grupo A - Ing. Software' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Descripción del grupo', example: 'Grupo de tesis de Ingeniería de Software', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ description: 'ID del asesor asignado', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id_asesor: number;

  @ApiProperty({ description: 'ID del período', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id_periodo: number;

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
}