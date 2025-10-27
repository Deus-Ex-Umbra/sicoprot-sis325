import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, MaxLength, Matches 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear una corrección
 * El estudiante usa este DTO cuando marca que corrigió una observación
 * 
 * VERSIÓN FUSIONADA:
 * - Incluye campos obligatorios: descripcion, coordenadas, páginas
 * - Incluye campos opcionales: titulo, archivo_url, color
 * - Elimina id_observacion e id_documento (vienen del endpoint URL)
 */
export class CrearCorreccionDto {
  // ========== CAMPOS OBLIGATORIOS ==========
    
    @ApiProperty({
        description: 'Descripción detallada de la corrección realizada por el estudiante',
        example: 'Se corrigió la redacción del capítulo 2, se ajustaron las referencias en formato APA y se agregaron las citas faltantes.',
    })
    @IsString()
    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
    descripcion: string;

    @ApiProperty({
        description: 'Número de versión del documento donde se realizó la corrección',
        example: 2,
    })
    @IsNumber()
    @Min(1, { message: 'La versión debe ser al menos 1' })
    version_corregida: number;

    // ========== COORDENADAS EN EL PDF (obligatorias) ==========
    
    @ApiProperty({
        description: 'Coordenada X inicial en el PDF',
        example: 10.5,
    })
    @IsNumber()
    @Min(0)
    x_inicio: number;

    @ApiProperty({
        description: 'Coordenada Y inicial en el PDF',
        example: 20.3,
    })
    @IsNumber()
    @Min(0)
    y_inicio: number;

    @ApiProperty({
        description: 'Coordenada X final en el PDF',
        example: 150.8,
    })
    @IsNumber()
    @Min(0)
    x_fin: number;

    @ApiProperty({
        description: 'Coordenada Y final en el PDF',
        example: 45.2,
    })
    @IsNumber()
    @Min(0)
    y_fin: number;

    @ApiProperty({
        description: 'Página inicial donde comienza la corrección',
        example: 2,
    })
    @IsNumber()
    @Min(1)
    pagina_inicio: number;

    @ApiProperty({
        description: 'Página final donde termina la corrección',
        example: 2,
    })
    @IsNumber()
    @Min(1)
    pagina_fin: number;

    // ========== CAMPOS OPCIONALES ==========
    
    @ApiProperty({
        description: 'Título breve de la corrección (opcional)',
        example: 'Corrección de referencias bibliográficas',
        required: false,
    })
    @IsOptional()
    @IsString()
    titulo?: string;

    @ApiProperty({
        description: 'URL o ruta del archivo corregido (si aplica)',
        example: 'https://mi-servidor.com/documentos/proyecto-v2.pdf',
        required: false,
    })
    @IsOptional()
    @IsString()
    archivo_url?: string;

    @ApiProperty({
        description: 'Color en formato hexadecimal para resaltar en el PDF',
        example: '#28a745',
        default: '#28a745',
        required: false,
    })
    @IsOptional()
    @IsString()
    @Matches(/^#[0-9A-F]{6}$/i, { 
        message: 'El color debe estar en formato hexadecimal #RRGGBB (ejemplo: #28a745)' 
    })
    color?: string;
}