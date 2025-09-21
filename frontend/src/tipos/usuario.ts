export const Rol = {
  Estudiante: 'estudiante',
  Asesor: 'asesor',
  Tutor: 'tutor',
  Tribunal: 'tribunal',
  Administrador: 'administrador',
} as const;

export type Rol = typeof Rol[keyof typeof Rol];

export interface Usuario {
  id: number;
  correo: string;
  rol: Rol;
  perfil?: {
    id_estudiante?: number;
    id_asesor?: number;
    nombre: string;
    apellido: string;
  };
}

export interface Proyecto {
  id: number;
  titulo: string;
  fecha_creacion: string;
  estudiante?: any;
  asesor?: any;
  documentos?: Documento[];
}

export interface Documento {
  id: number;
  nombre_archivo: string;
  ruta_archivo: string;
  version: number;
  fecha_subida: string;
  proyecto?: Proyecto;
}

export interface Observacion {
  id: number;
  titulo: string;
  contenido: string;
  estado: 'pendiente' | 'corregida' | 'aprobada';
  x_inicio: number;
  y_inicio: number;
  x_fin: number;
  y_fin: number;
  pagina_inicio: number;
  pagina_fin: number;
  archivada: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  autor: any;
  correccion?: Correccion;
}

export interface Correccion {
  id: number;
  titulo: string;
  descripcion: string;
  x_inicio: number;
  y_inicio: number;
  x_fin: number;
  y_fin: number;
  pagina_inicio: number;
  pagina_fin: number;
  fecha_creacion: string;
  estudiante: any;
  observacion?: Observacion;
}