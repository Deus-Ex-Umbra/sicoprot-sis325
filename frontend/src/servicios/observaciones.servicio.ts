import api from './api';
import { type Observacion } from '../tipos/usuario';

export const obtenerObservacionesPorDocumento = async (documentoId: number): Promise<Observacion[]> => {
  const { data } = await api.get(`/observaciones/por-documento/${documentoId}`);
  return data;
};

export const crearObservacion = async (documentoId: number, observacion: any): Promise<Observacion> => {
  const { data } = await api.post(`/observaciones/${documentoId}/crear`, observacion);
  return data;
};