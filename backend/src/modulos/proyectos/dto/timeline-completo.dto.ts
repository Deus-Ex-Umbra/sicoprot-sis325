import { EtapaProyecto } from '../enums/etapa-proyecto.enum';

export interface ReunionTimeline {
  id: number;
  titulo: string;
  fecha_programada: Date;
  fecha_realizada?: Date;
  estado: string;
  notas_reunion_html?: string;
  observaciones_generadas?: string;
}

export interface VersionDocumentoTimeline {
  id: number;
  nombre_archivo: string;
  version: number;
  fecha_subida: Date;
  observaciones_count: number;
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

export interface CorreccionTimeline {
  id: number;
  estado: string;
  fecha_creacion: Date;
  fecha_verificacion?: Date;
  comentario_verificacion?: string;
}

export interface DefensaTimeline {
  solicitada: boolean;
  fecha_solicitud?: Date;
  aprobada?: boolean;
  fecha_aprobacion?: Date;
  tribunales?: { nombre: string; correo: string }[];
  comentarios?: string;
}

export class TimelineCompletoDto {
  proyecto: {
    id: number;
    titulo: string;
    etapa_actual: EtapaProyecto;
    fecha_creacion: Date;
  };

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

  linea_tiempo: Array<{
    tipo: 'perfil_inicio' | 'observacion' | 'correccion' | 'version_documento' | 'perfil_aprobado' | 'proyecto_inicio' | 'reunion' | 'proyecto_listo' | 'defensa_solicitada' | 'defensa_aprobada' | 'proyecto_terminado' | 'propuesta';
    fecha: Date;
    titulo: string;
    descripcion?: string;
    icono?: string;
  }>;
}