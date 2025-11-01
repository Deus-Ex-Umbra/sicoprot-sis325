// src/tipos/observacion.ts

// Usuario básico
export interface Usuario {
    id: number;
    correo: string;
    rol: string;
    estado: string;
}

// Estudiante
export interface Estudiante {
    id: number;
    nombre: string;        // ✅ AGREGADO
    apellido: string;      // ✅ AGREGADO
    usuario: Usuario;
}

// Asesor
export interface Asesor {
    id: number;
    nombre: string;
    apellido: string;
    usuario: Usuario;
}

// Proyecto
export interface Proyecto {
    id: number;
    titulo: string;        // ✅ AGREGADO
    fecha_creacion: string;
    estudiantes: Estudiante[];
    asesor: Asesor;
}

// Documento
export interface Documento {
    id: number;
    nombre_archivo: string;  // ✅ CORREGIDO (era "titulo")
    ruta_archivo: string;
    version: number;
    fecha_subida: string;
    proyecto: Proyecto;
}

// Corrección (puede ser null)
export interface Correccion {
    id: number;
    comentario: string;
    fecha_creacion: string;
}

// Observación principal
export interface Observacion {
    id: number;
    titulo: string;
    contenido_detallado: string;  // ✅ CORREGIDO (era "contenido")
    descripcion_corta: string;    // ✅ AGREGADO
    estado: string;               // ✅ CORREGIDO (acepta mayúsculas)
    x_inicio: number;
    y_inicio: number;
    x_fin: number;
    y_fin: number;
    pagina_inicio: number;
    pagina_fin: number;
    archivada: boolean;
    version_observada?: number;
    version_corregida?: number;
    fecha_verificacion?: string;
    comentario_verificacion?: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    autor: Asesor;                // ✅ AGREGADO
    documento: Documento;
    correccion?: Correccion | null;
}