import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoObservacion } from '../enums/estado-observacion.enum';

export class VerificarObservacionDto {
    @ApiProperty({
        description: 'Nuevo estado de verificación',
        enum: [EstadoObservacion.CORREGIDO, EstadoObservacion.RECHAZADO],
        example: EstadoObservacion.CORREGIDO
    })
    @IsIn([EstadoObservacion.CORREGIDO, EstadoObservacion.RECHAZADO])
    nuevoEstado: EstadoObservacion;

    @ApiProperty({
        description: 'Comentarios de la verificación',
        required: false,
        example: 'La observación ha sido verificada correctamente'
    })
    @IsOptional()
    @IsString()
    verificacion_asesor?: string;
}
