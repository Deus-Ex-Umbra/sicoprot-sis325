import api from './api';
import { IniciarSesionDto } from '../../../backend/src/modulos/autenticacion/dto/iniciar-sesion.dto';

export const iniciarSesion = async (datos: IniciarSesionDto) => {
  const { data } = await api.post('/autenticacion/iniciar-sesion', datos);
  return data;
};