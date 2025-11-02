import { EtapaProyecto } from "../enums/etapa-proyecto.enum";

export class AvanceHistorial {
    etapa: 'propuesta' | 'perfil' | 'proyecto';
    estado: 'pendiente' | 'aprobado' | 'rechazado';
    fecha?: Date;
    comentarios?: string;
}

export class RevisionHistorial {
    id: number;
    titulo: string;
    estado: 'pendiente' | 'corregido' | 'rechazado';
    etapa_observada: EtapaProyecto;
    fecha_creacion: Date;
    fecha_verificacion?: Date;
    documento: string;
    version_observada?: number;
    version_corregida?: number;
    comentarios_asesor?: string;
    comentario_verificacion?: string;
}

export class HistorialProgresoDto {
    avances: AvanceHistorial[];
    revisiones: RevisionHistorial[];
    defensa: {
        completada: boolean;
        fecha?: Date;
        comentarios?: string;
    };
}