import api from './api';
import { type Correccion } from '../tipos/usuario';

export const obtenerCorreccionesPorDocumento = async (documentoId: number): Promise<Correccion[]> => {
  const { data } = await api.get(`/correcciones/por-documento/${documentoId}`);
  return data;
};

export const obtenerCorreccionesPorProyecto = async (proyectoId: number): Promise<Correccion[]> => {
  const { data } = await api.get(`/correcciones/por-proyecto/${proyectoId}`);
  return data;
};

export const obtenerCorreccionesPorEstudiante = async (): Promise<Correccion[]> => {
  const { data } = await api.get('/correcciones/por-estudiante');
  return data;
};

export const crearCorreccion = async (correccion: any): Promise<Correccion> => {
  const { data } = await api.post('/correcciones', correccion);
  return data;
};

export const actualizarCorreccion = async (
  correccionId: number,
  datos: any
): Promise<Correccion> => {
  const { data } = await api.patch(`/correcciones/${correccionId}`, datos);
  return data;
};

export const eliminarCorreccion = async (correccionId: number): Promise<void> => {
  await api.delete(`/correcciones/${correccionId}`);
};