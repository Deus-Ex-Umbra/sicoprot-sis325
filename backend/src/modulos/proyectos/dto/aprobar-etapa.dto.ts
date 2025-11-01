import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EtapaProyecto } from '../enums/etapa-proyecto.enum';

export class AprobarEtapaDto {
    @ApiProperty({
        description: 'Etapa a aprobar',
        enum: EtapaProyecto,
        example: EtapaProyecto.PROPUESTA
    })
    @IsEnum(EtapaProyecto)
    etapa: EtapaProyecto;

    @ApiProperty({
        description: 'Comentarios opcionales del asesor',
        required: false,
        example: 'Propuesta aprobada con observaciones menores'
    })
    @IsOptional()
    @IsString()
    comentarios?: string;
}