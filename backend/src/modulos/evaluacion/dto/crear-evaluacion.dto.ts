import { IsOptional, IsInt, IsString, Min, Max } from 'class-validator';

export class CrearEvaluacionDto {
    @IsOptional()
    @IsString()
    observaciones?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100) // o el rango que uses
    calificacion?: number;
}