export const Rol = {
  Estudiante: 'estudiante',
  Asesor: 'asesor',
  Tutor: 'tutor',
  Tribunal: 'tribunal',
  Administrador: 'administrador',
} as const;

export type Rol = typeof Rol[keyof typeof Rol];

export const EstadoUsuario = {
  Pendiente: 'pendiente',
  Activo: 'activo',
  Inactivo: 'inactivo',
  Eliminado: 'eliminado',
} as const;

export type EstadoUsuario = typeof EstadoUsuario[keyof typeof EstadoUsuario];

export interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  usuario?: Usuario;
}

export interface Usuario {
  id: number;
  correo: string;
  rol: Rol;
  estado: EstadoUsuario;
  fecha_aprobacion?: string;
  creado_en: string;
  actualizado_en: string;
  perfil?: {
    id_estudiante?: number;
    id_asesor?: number;
    nombre: string;
    apellido: string;
    grupo?: Grupo;
    grupos?: Grupo[];
  };
}

export interface Periodo {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha_inicio_semestre: string;
  fecha_fin_semestre: string;
  fecha_inicio_inscripciones: string;
  fecha_fin_inscripciones: string;
  activo: boolean;
  fecha_creacion: string;
  grupos?: Grupo[];
}

export interface Grupo {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  asesor: any;
  periodo: Periodo;
  estudiantes?: Estudiante[];
  fecha_creacion: string;
}

export interface SolicitudRegistro {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: Rol;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  comentarios_admin?: string;
  fecha_solicitud: string;
  fecha_respuesta?: string;
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
  estado: string;
  comentarios_asesor?: string;
  x_inicio: number;
  y_inicio: number;
  x_fin: number;
  y_fin: number;
  pagina_inicio: number;
  pagina_fin: number;
  color: string;
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
  color: string;
  fecha_creacion: string;
  estudiante: any;
  observacion?: Observacion;
}