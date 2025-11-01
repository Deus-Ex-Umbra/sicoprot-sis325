import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AccionTema {
    APROBAR = 'aprobar',
    RECHAZAR = 'rechazar'
}

export class AccionTemaDto {
    @ApiProperty({
    description: 'Acción a realizar sobre el tema',
    enum: AccionTema,
    example: AccionTema.APROBAR
    })
    @IsEnum(AccionTema)
    accion: AccionTema;

    @ApiProperty({
    description: 'Comentarios opcionales del asesor',
    required: false,
    example: 'Tema aprobado, puede proceder con el desarrollo'
    })
    @IsOptional()
    @IsString()
comentarios?: string;
}