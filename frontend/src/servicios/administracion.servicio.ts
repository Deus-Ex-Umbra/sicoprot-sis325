import api from './api';
import { type Usuario } from '../tipos/usuario';

export const obtenerTodosUsuarios = async (): Promise<Usuario[]> => {
  const { data } = await api.get('/administracion/usuarios');
  return data;
};

export const obtenerEstudiantes = async (): Promise<any[]> => {
  const { data } = await api.get('/administracion/estudiantes');
  return data;
};

export const obtenerEstudiantesSinGrupo = async (): Promise<any[]> => {
  const { data } = await api.get('/administracion/estudiantes/sin-grupo');
  return data;
};

export const obtenerEstadisticas = async (): Promise<any> => {
  const { data } = await api.get('/administracion/estadisticas');
  return data;
};

export const cambiarEstadoUsuario = async (idUsuario: number, estado: string): Promise<Usuario> => {
  const { data } = await api.patch(`/administracion/usuarios/${idUsuario}/cambiar-estado`, { estado });
  return data;
};