export interface EtapaCronograma {
    nombre: 'propuesta' | 'perfil' | 'proyecto';
    fecha_limite_entrega: Date | null;
    estado: 'pendiente' | 'aprobado' | 'vencido';
    dias_restantes: number | null;
    recomendaciones: string[];
}

export class CronogramaProyectoDto {
    periodo: {
        nombre: string;
        fecha_inicio: Date;
        fecha_fin: Date;
    };
    etapas: EtapaCronograma[];
    etapa_actual: 'propuesta' | 'perfil' | 'proyecto';
}