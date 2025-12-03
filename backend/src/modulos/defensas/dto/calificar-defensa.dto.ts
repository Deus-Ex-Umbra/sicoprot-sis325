import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CalificarDefensaDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  calificacion: number;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsOptional()
  observaciones_publicas?: string; // Solo para pre-defensa, visible al estudiante
}
