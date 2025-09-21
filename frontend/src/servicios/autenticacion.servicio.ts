import api from './api';

export interface IniciarSesionDto {
  correo: string;
  contrasena: string;
}

export interface RegistroDto {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  rol: string;
}

export const iniciarSesion = async (datos: IniciarSesionDto) => {
  const { data } = await api.post('/autenticacion/iniciar-sesion', datos);
  return data;
};

export const registrarse = async (datos: RegistroDto) => {
  const { data } = await api.post('/autenticacion/registrarse', datos);
  return data;
};

export const cerrarSesion = async () => {
  const { data } = await api.post('/autenticacion/cerrar-sesion');
  return data;
};