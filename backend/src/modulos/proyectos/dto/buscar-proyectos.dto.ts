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
        description: 'Filtrar por ID de período académico',
        required: false,
        example: "1"
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

    @ApiProperty({
        description: 'Filtrar por año de creación',
        required: false,
        example: "2024"
    })
    @IsOptional()
    @IsString()
    anio?: string;

    @ApiProperty({
        description: 'Filtrar por carrera (busca coincidencias parciales)',
        required: false,
        example: 'software'
    })
    @IsOptional()
    @IsString()
    carrera?: string;

    @ApiProperty({
        description: 'Filtrar por ID de asesor',
        required: false,
        example: "1"
    })
    @IsOptional()
    @IsString()
    asesorId?: string;
}

export class ResultadoBusqueda {
    id: number;
    titulo: string;
    resumen?: string;
    palabras_clave: string[];
    autor: string;
    asesor: string;
    fecha_creacion: Date;
    etapa_actual: EtapaProyecto;
    proyecto_aprobado: boolean;
}