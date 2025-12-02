// src/tipos/proyecto.tipo.ts
import { EtapaProyecto } from './etapa-proyecto.enum';

export interface Proyecto {
    id: number;
    titulo: string;
    etapa_actual: EtapaProyecto; // ✅ fuertemente tipado
    // ...otros campos
}