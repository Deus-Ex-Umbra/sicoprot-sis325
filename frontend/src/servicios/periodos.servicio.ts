import api from './api';
import { type Periodo } from '../tipos/usuario';

export const obtenerPeriodos = async (): Promise<Periodo[]> => {
  const { data } = await api.get('/periodos');
  return data;
};

export const obtenerPeriodoActivo = async (): Promise<Periodo> => {
  const { data } = await api.get('/periodos/activo');
  return data;
};

export const obtenerPeriodoPorId = async (id: number): Promise<Periodo> => {
  const { data } = await api.get(`/periodos/${id}`);
  return data;
};

export const crearPeriodo = async (periodo: any): Promise<Periodo> => {
  const { data } = await api.post('/periodos', periodo);
  return data;
};

export const actualizarPeriodo = async (id: number, periodo: any): Promise<Periodo> => {
  const { data } = await api.patch(`/periodos/${id}`, periodo);
  return data;
};

export const eliminarPeriodo = async (id: number): Promise<void> => {
  await api.delete(`/periodos/${id}`);
};