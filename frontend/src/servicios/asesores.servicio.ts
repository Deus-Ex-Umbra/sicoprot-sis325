import api from './api';
import { type Usuario } from '../tipos/usuario';

export const obtenerAsesores = async (): Promise<Usuario[]> => {
  const { data } = await api.get('/asesores');
  return data;
};