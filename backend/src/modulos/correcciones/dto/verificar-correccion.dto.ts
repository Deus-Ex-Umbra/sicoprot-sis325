import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// IMPORTANTE: Importar del módulo correcto
// Si tienes EstadoCorreccion, usa ese. Si no, usa EstadoObservacion
// import { EstadoCorreccion } from '../enums/estado-correccion.enum';  // ← Opción A
import { EstadoObservacion } from '../../observaciones/enums/estado-observacion.enum';  // ← Opción B (actual)

/**
 * DTO para verificar una corrección (asesor)
 * El asesor revisa la corrección del estudiante y decide si la acepta o rechaza
 * 
 * FLUJO:
 * 1. Estudiante crea corrección → estado: PENDIENTE_REVISION
 * 2. Asesor verifica con este DTO
 * 3. Si ACEPTA → Observacion.estado = CORREGIDO
 * 4. Si RECHAZA → Observacion.estado = RECHAZADO (estudiante debe corregir de nuevo)
 */
export class VerificarCorreccionDto {
    @ApiProperty({
        description: 'Resultado de la verificación del asesor',
        enum: [EstadoObservacion.CORREGIDO, EstadoObservacion.RECHAZADO],
        example: EstadoObservacion.CORREGIDO,
    })
    @IsIn([EstadoObservacion.CORREGIDO, EstadoObservacion.RECHAZADO], {
        message: 'El resultado debe ser CORREGIDO o RECHAZADO',
    })
    resultado: EstadoObservacion;

    @ApiProperty({
        description: 'Comentario del asesor explicando su decisión',
        example: 'Excelente trabajo. La corrección cumple con todos los requisitos solicitados.',
        required: false,
    })
    @IsOptional()
    @IsString()
    comentario_verificacion?: string;
}

/**
 * NOTAS IMPORTANTES:
 * 
 * 1. CREAR-CORRECCION:
 *    - Eliminé id_observacion e id_documento del DTO
 *    - Razón: Vienen en la URL del endpoint POST /observaciones/:id/correccion
 *    - El service los obtiene del parámetro de ruta
 * 
 * 2. MARCAR-CORREGIDO vs ACTUALIZAR:
 *    - MarcarCorregidoDto: Solo actualiza versión (uso frecuente)
 *    - ActualizarCorreccionDto: Actualiza cualquier campo (uso menos frecuente)
 * 
 * 3. VERIFICAR-CORRECCION:
 *    - Usa EstadoObservacion en lugar de EstadoCorreccion
 *    - Razón: El resultado afecta directamente al estado de la Observación
 *    - Si prefieres usar EstadoCorreccion, cambia el import y el enum
 * 
 * 4. VALIDACIONES:
 *    - Todos los números tienen @Min() para evitar valores negativos
 *    - Color validado con regex hexadecimal
 *    - Descripción limitada a 1000 caracteres
 * 
 * 5. COMPATIBILIDAD:
 *    - Mantiene todos los campos de la versión de tus compañeros
 *    - Agrega validaciones y documentación mejorada
 *    - Lista para Swagger (genera documentación automática)
 */