export interface Usuario {
    id: number;
    correo: string;
    rol: string;
    estado: string;
}

export interface Estudiante {
    id: number;
    nombre: string;      
    apellido: string; 
    usuario: Usuario;
}

export interface Asesor {
    id: number;
    nombre: string;
    apellido: string;
    usuario: Usuario;
}

export interface Proyecto {
    id: number;
    titulo: string; 
    fecha_creacion: string;
    estudiantes: Estudiante[];
    asesor: Asesor;
}

export interface Documento {
    id: number;
    nombre_archivo: string; 
    ruta_archivo: string;
    version: number;
    fecha_subida: string;
    proyecto: Proyecto;
}

export interface Correccion {
    id: number;
    comentario: string;
    fecha_creacion: string;
}

export interface Observacion {
    id: number;
    titulo: string;
    contenido_detallado: string;
    descripcion_corta: string;
    estado: string;
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
    autor: Asesor;
    documento: Documento;
    correccion?: Correccion | null;
}