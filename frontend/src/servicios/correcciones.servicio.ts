import api from './api';
import { type Correccion } from '../tipos/usuario';

export const obtenerCorreccionesPorDocumento = async (documentoId: number): Promise<Correccion[]> => {
  const { data } = await api.get(`/correcciones/por-documento/${documentoId}`);
  return data;
};

export const crearCorreccion = async (correccion: any): Promise<Correccion> => {
  const { data } = await api.post('/correcciones', correccion);
  return data;
};