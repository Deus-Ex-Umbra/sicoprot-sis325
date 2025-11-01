import { IsOptional, IsString, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EtapaProyecto } from '../enums/etapa-proyecto.enum';

export class BuscarProyectosDto {
    @ApiProperty({
        description: 'Término de búsqueda (busca en título, resumen y palabras clave)',
        required: false,
        example: 'machine learning'
    })
    @IsOptional()
    @IsString()
    termino?: string;

    @ApiProperty({
        description: 'Filtrar por período académico',
        required: false,
        example: 1
    })
    @IsOptional()
    @IsString()
    periodoId?: string;

    @ApiProperty({
        description: 'Filtrar por estado del proyecto',
        required: false,
        enum: EtapaProyecto,
        example: EtapaProyecto.PROYECTO
    })
    @IsOptional()
    @IsEnum(EtapaProyecto)
    etapa?: EtapaProyecto;

    @ApiProperty({
        description: 'Filtrar solo proyectos completados/aprobados',
        required: false,
        example: true
    })
    @IsOptional()
    soloAprobados?: boolean;
}

export class ResultadoBusqueda {
    id: number;
    titulo: string;
    resumen?: string;
    palabras_clave: string[];
    autor: string;
    fecha_creacion: Date;
    etapa_actual: EtapaProyecto;
    proyecto_aprobado: boolean;
}