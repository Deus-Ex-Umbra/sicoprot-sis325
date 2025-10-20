import api from './api';
import { type SolicitudRegistro } from '../tipos/usuario';

export const crearSolicitud = async (solicitud: any): Promise<SolicitudRegistro> => {
  const { data } = await api.post('/solicitudes-registro', solicitud);
  return data;
};

export const obtenerSolicitudes = async (): Promise<SolicitudRegistro[]> => {
  const { data } = await api.get('/solicitudes-registro');
  return data;
};

export const obtenerSolicitudesPendientes = async (): Promise<SolicitudRegistro[]> => {
  const { data } = await api.get('/solicitudes-registro/pendientes');
  return data;
};

export const responderSolicitud = async (id: number, respuesta: any): Promise<SolicitudRegistro> => {
  const { data } = await api.patch(`/solicitudes-registro/${id}/responder`, respuesta);
  return data;
};

export const eliminarSolicitud = async (id: number): Promise<void> => {
  await api.delete(`/solicitudes-registro/${id}`);
};