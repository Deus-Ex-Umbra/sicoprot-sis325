/**
 * ENUM: Estados posibles de una corrección
 * 
 * Flujo de estados:
 * PENDIENTE_REVISION → ACEPTADA (fin)
 * PENDIENTE_REVISION → RECHAZADA (el estudiante debe corregir de nuevo)
 */
export enum EstadoCorreccion {
  PENDIENTE_REVISION = 'PENDIENTE_REVISION',  // Estudiante la creó, asesor aún no revisa
  ACEPTADA = 'ACEPTADA',                      // Asesor acepta la corrección
  RECHAZADA = 'RECHAZADA',                    // Asesor rechaza, necesita más correcciones
}