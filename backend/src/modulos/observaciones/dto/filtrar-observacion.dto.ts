import { IsNotEmpty,IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoObservacion } from '../enums/estado-observacion.enum';
import { Type } from 'class-transformer';

export class FiltrosObservacionesDto {
    @IsOptional()
    @Type(() => Number)  @IsNumber()
    documentoId?: number;

    @IsOptional()
    @IsNumber()
    estudianteId?: number;

    @IsOptional()
    @IsEnum(EstadoObservacion)
    estado?: EstadoObservacion;

    @IsOptional()
    @IsNumber()
    versionOriginal?: number;
}