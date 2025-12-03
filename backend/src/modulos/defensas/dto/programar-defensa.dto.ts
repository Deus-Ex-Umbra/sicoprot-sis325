import { IsEnum, IsInt, IsOptional, IsString, IsDateString, IsArray } from 'class-validator';
import { TipoDefensa } from '../entidades/defensa.entidad';

export class ProgramarDefensaDto {
  @IsInt()
  id_proyecto: number;

  @IsDateString()
  fecha_programada: string;

  @IsString()
  @IsOptional()
  lugar?: string;

  @IsString()
  @IsOptional()
  enlace?: string;

  @IsEnum(TipoDefensa)
  tipo: TipoDefensa;

  @IsArray()
  @IsInt({ each: true })
  ids_tribunales: number[];
}
