import api from './api';
import { type Usuario } from '../tipos/usuario';

export const actualizarPerfil = async (datos: any): Promise<Usuario> => {
  const { data } = await api.patch('/usuarios/perfil/actualizar', datos);
  return data;
};