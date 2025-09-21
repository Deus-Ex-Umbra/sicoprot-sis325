import api from './api';
import { type Documento } from '../tipos/usuario';

export const subirDocumento = async (proyectoId: number, formData: FormData): Promise<Documento> => {
  const { data } = await api.post(`/documentos/subir/${proyectoId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};