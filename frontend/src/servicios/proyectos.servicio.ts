import api from './api';
import { type Proyecto } from '../tipos/usuario';

interface CrearProyectoPayload {
  titulo: string;
  id_asesor: number;
}

export const obtenerProyectos = async (): Promise<Proyecto[]> => {
  const { data } = await api.get('/proyectos');
  return data;
};

export const obtenerProyectoPorId = async (id: number): Promise<Proyecto> => {
  const { data } = await api.get(`/proyectos/${id}`);
  return data;
};

export const crearProyecto = async (proyecto: CrearProyectoPayload): Promise<Proyecto> => {
  const { data } = await api.post('/proyectos', proyecto);
  return data;
};