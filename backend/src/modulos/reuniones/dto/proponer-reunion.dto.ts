import { IsInt, IsString, IsOptional, IsDateString } from 'class-validator';

export class ProponerReunionDto {
  @IsInt()
  id_proyecto: number;

  @IsString()
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  rango_fecha_inicio: string;

  @IsDateString()
  rango_fecha_fin: string;
}
