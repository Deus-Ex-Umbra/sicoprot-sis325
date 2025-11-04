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

export const EtapaProyecto = {
  PROPUESTA: 'propuesta',
  PERFIL: 'perfil',
  PROYECTO: 'proyecto',
  LISTO_DEFENSA: 'listo_defensa',
  SOLICITUD_DEFENSA: 'solicitud_defensa',
  TERMINADO: 'terminado',
} as const;

export type EtapaProyecto = typeof EtapaProyecto[keyof typeof EtapaProyecto];

export const EstadoObservacion = {
  PENDIENTE: 'pendiente',
  EN_REVISION: 'en_revision',
  CORREGIDA: 'corregida',
  RECHAZADO: 'rechazado',
} as const;

export type EstadoObservacion = typeof EstadoObservacion[keyof typeof EstadoObservacion];

export const EstadoPropuesta = {
  PENDIENTE: 'pendiente',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada',
} as const;

export type EstadoPropuesta = typeof EstadoPropuesta[keyof typeof EstadoPropuesta];

export const EstadoReunion = {
  PROGRAMADA: 'programada',
  REALIZADA: 'realizada',
  CANCELADA: 'cancelada',
} as const;

export type EstadoReunion = typeof EstadoReunion[keyof typeof EstadoReunion];

export interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  ruta_foto?: string;
  usuario?: Usuario;
  proyecto?: Proyecto;
  grupos?: Grupo[];
}

export interface Asesor {
  id: number;
  nombre: string;
  apellido: string;
  ruta_foto?: string;
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
  ruta_foto?: string;
  perfil?: {
    id_estudiante?: number;
    id_asesor?: number;
    nombre: string;
    apellido: string;
    ruta_foto?: string;
    foto_url?: string;
    grupo?: Grupo | null;
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
  fecha_limite_propuesta?: string;
  fecha_limite_perfil?: string;
  fecha_limite_proyecto?: string;
}

export interface Grupo {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  tipo: 'taller_grado_i' | 'taller_grado_ii';
  asesor: Asesor;
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

export interface PropuestaTema {
  id: number;
  titulo: string;
  cuerpo_html: string;
  estado: EstadoPropuesta;
  comentarios_asesor_html: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estudiante: Estudiante;
}

export interface Reunion {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha_programada: string;
  fecha_realizada?: string;
  estado: EstadoReunion;
  notas_reunion_html?: string;
  fecha_creacion: string;
  asesor: Asesor;
}

export interface Tribunal {
  nombre: string;
  correo: string;
}

export interface Proyecto {
  id: number;
  titulo: string;
  fecha_creacion: string;
  estudiantes?: Estudiante[];
  asesor?: Asesor;
  documentos?: Documento[];
  propuestas_tema?: PropuestaTema[];
  reuniones?: Reunion[];
  observaciones?: Observacion[];
  etapa_actual: EtapaProyecto;
  propuesta_aprobada: boolean;
  perfil_aprobado: boolean;
  proyecto_aprobado: boolean;
  listo_para_defender: boolean;
  ruta_memorial?: string;
  comentarios_defensa?: string;
  tribunales?: Tribunal[];
  fecha_aprobacion_propuesta?: string;
  fecha_aprobacion_perfil?: string;
  fecha_aprobacion_proyecto?: string;
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
  contenido_html: string;
  estado: EstadoObservacion;
  comentarios_asesor_html?: string;
  x_inicio: number;
  y_inicio: number;
  x_fin: number;
  y_fin: number;
  pagina_inicio: number;
  pagina_fin: number;
  color: string;
  archivada: boolean;
  version_observada: number;
  etapa_observada: EtapaProyecto;
  fecha_creacion: string;
  fecha_actualizacion: string;
  autor: Asesor;
  documento?: Documento | null;
  proyecto?: Proyecto | null;
  correcciones?: Correccion[];
}

export interface Correccion {
  id: number;
  titulo: string;
  descripcion_html: string;
  version_corregida: number;
  x_inicio: number;
  y_inicio: number;
  x_fin: number;
  y_fin: number;
  pagina_inicio: number;
  pagina_fin: number;
  color: string;
  estado: 'PENDIENTE_REVISION' | 'ACEPTADA' | 'RECHAZADA';
  estado_verificacion?: string;
  comentario_verificacion_html?: string;
  fecha_verificacion?: Date;
  fecha_creacion: string;
  estudiante: Estudiante;
  observacion?: Observacion;
}

export interface EtapaCronograma {
  nombre: 'propuesta' | 'perfil' | 'proyecto';
  fecha_limite_entrega: Date | null;
  estado: 'pendiente' | 'aprobado' | 'vencido';
  dias_restantes: number | null;
  recomendaciones: string[];
}

export interface CronogramaProyectoDto {
  periodo: {
    nombre: string;
    fecha_inicio: Date;
    fecha_fin: Date;
  };
  etapas: EtapaCronograma[];
  etapa_actual: EtapaProyecto;
}

export interface PropuestaTimeline {
  id: number;
  numero_propuesta: number;
  titulo: string;
  estado: string;
  fecha_creacion: Date;
  fecha_revision?: Date;
  comentario_asesor?: string | null;
}

export interface ReunionTimeline {
  id: number;
  titulo: string;
  fecha_programada: Date;
  fecha_realizada?: Date;
  estado: string;
  notas_reunion_html?: string;
}

export interface VersionDocumentoTimeline {
  id: number;
  nombre_archivo: string;
  version: number;
  fecha_subida: Date;
  observaciones_count: number;
}

export interface CorreccionTimeline {
  id: number;
  estado: string;
  fecha_creacion: Date;
  fecha_verificacion?: Date;
  comentario_verificacion?: string;
}

export interface ObservacionTimeline {
  id: number;
  titulo: string;
  estado: string;
  fecha_creacion: Date;
  fecha_verificacion?: Date;
  documento: string;
  version_observada?: number;
  tiene_correccion: boolean;
  correcciones?: CorreccionTimeline[];
}

export interface DefensaTimeline {
  solicitada: boolean;
  fecha_solicitud?: Date;
  aprobada?: boolean;
  fecha_aprobacion?: Date;
  tribunales?: Tribunal[];
  comentarios?: string;
}

export interface EventoLineaTiempo {
  tipo: string;
  fecha: Date;
  titulo: string;
  descripcion?: string;
  icono?: string;
}

export interface TimelineCompletoDto {
  proyecto: {
    id: number;
    titulo: string;
    etapa_actual: EtapaProyecto;
    fecha_creacion: Date;
  };
  propuestas: PropuestaTimeline[];
  perfil: {
    aprobado: boolean;
    fecha_aprobacion?: Date;
    comentarios?: string;
    versiones: VersionDocumentoTimeline[];
    observaciones: ObservacionTimeline[];
  };
  proyecto_desarrollo: {
    aprobado: boolean;
    fecha_aprobacion?: Date;
    comentarios?: string;
    reuniones: ReunionTimeline[];
    versiones: VersionDocumentoTimeline[];
    observaciones: ObservacionTimeline[];
  };
  defensa: DefensaTimeline;
  linea_tiempo: EventoLineaTiempo[];
}