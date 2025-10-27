// src/tipos/observacion.ts

// Usuario básico
export interface Usuario {
    id: number;
    nombre: string;
    email: string;
}

// Estudiante
export interface Estudiante {
    id: number;
    usuario: Usuario;
}

// Proyecto
export interface Proyecto {
    id: number;
    estudiantes: Estudiante[];
}

// Documento
export interface Documento {
    id: number;
    titulo: string;
    version?: number;
    proyecto: Proyecto;
}

// Corrección (puede ser null)
export interface Correccion {
    id: number;
    descripcion: string;
    titulo?: string;
    color: string;
    x_inicio: number;
    y_inicio: number;
    x_fin: number;
    y_fin: number;
    pagina_inicio: number;
    pagina_fin: number;
    fecha_creacion: string;
}

// Observación principal
export interface Observacion {
    id: number;
    titulo: string;
    contenido: string;
    estado: 'pendiente' | 'corregido' | 'rechazado';
    color: string;
    pagina_inicio: number;
    pagina_fin?: number;
    x_inicio?: number;
    y_inicio?: number;
    x_fin?: number;
    y_fin?: number;
    fecha_creacion: string;
    archivada: boolean;
    documento: Documento;
    correccion: Correccion | null; // null si no ha corregido
}