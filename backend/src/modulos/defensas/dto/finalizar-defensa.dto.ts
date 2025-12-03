import { IsOptional, IsString, IsBoolean, IsArray, IsInt } from 'class-validator';

export class FinalizarDefensaDto {
  @IsString()
  @IsOptional()
  comentarios_admin?: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  ids_notas_invalidas?: number[];

  @IsString()
  @IsOptional()
  motivo_invalidacion?: string;
}
