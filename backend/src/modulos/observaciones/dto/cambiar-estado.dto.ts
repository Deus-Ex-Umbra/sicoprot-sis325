import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoObservacion } from '../enums/estado-observacion.enum'; // Ajusta la ruta si el enum está en otro lugar

export class CambiarEstadoDto {
    @IsEnum(EstadoObservacion, {
        message: 'El estado debe ser un valor válido de EstadoObservacion',
    })
    estado: EstadoObservacion;

    @IsOptional()
    @IsString({ message: 'Los comentarios del asesor deben ser una cadena de texto' })
    comentarios_asesor?: string;
}