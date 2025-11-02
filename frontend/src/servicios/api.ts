import axios from 'axios';
import { 
  type Usuario, 
  type Proyecto, 
  type Documento, 
  type Observacion, 
  type Correccion,
  type Grupo,
  type Periodo,
  type SolicitudRegistro
} from '../tipos/usuario';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const autenticacion = {
  iniciar_sesion: async (correo: string, contrasena: string) => {
    const { data } = await api.post('/autenticacion/iniciar-sesion', { correo, contrasena });
    if (data.token_acceso) {
      localStorage.setItem('token', data.token_acceso);
    }
    return data;
  },

  cerrar_sesion: () => {
    localStorage.removeItem('token');
  },

  obtener_perfil: async (): Promise<Usuario> => {
    const { data } = await api.get('/autenticacion/perfil');
    return data;
  },
};

export const proyectos = {
  obtener_todos: async (): Promise<Proyecto[]> => {
    const { data } = await api.get('/proyectos');
    return data;
  },

  obtener_por_id: async (id: number): Promise<Proyecto> => {
    const { data } = await api.get(`/proyectos/${id}`);
    return data;
  },

  crear: async (proyecto: any): Promise<Proyecto> => {
    const { data } = await api.post('/proyectos', proyecto);
    return data;
  },

  actualizar: async (id: number, proyecto: any): Promise<Proyecto> => {
    const { data } = await api.patch(`/proyectos/${id}`, proyecto);
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/proyectos/${id}`);
  },

  obtener_por_estudiante: async (): Promise<Proyecto[]> => {
    const { data } = await api.get('/proyectos/estudiante');
    return data;
  },

  obtener_por_asesor: async (): Promise<Proyecto[]> => {
    const { data } = await api.get('/proyectos/asesor');
    return data;
  },
};

export const documentos = {
  subir: async (proyecto_id: number, form_data: FormData): Promise<Documento> => {
    const { data } = await api.post(`/documentos/${proyecto_id}`, form_data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  obtener_por_proyecto: async (proyecto_id: number): Promise<Documento[]> => {
    const { data } = await api.get(`/documentos/proyecto/${proyecto_id}`);
    return data;
  },

  obtener_archivo: (documento_id: number): string => {
    return `${api.defaults.baseURL}/documentos/${documento_id}/archivo`;
  },

  eliminar: async (documento_id: number): Promise<void> => {
    await api.delete(`/documentos/${documento_id}`);
  },
};

export const observaciones = {
  crear: async (documento_id: number, observacion: any): Promise<Observacion> => {
    const { data } = await api.post(`/observaciones/${documento_id}/crear`, observacion);
    return data;
  },

  obtener_por_documento: async (documento_id: number): Promise<Observacion[]> => {
    const { data } = await api.get(`/observaciones/por-documento/${documento_id}`);
    return data;
  },

  obtener_por_proyecto: async (proyecto_id: number): Promise<Observacion[]> => {
    const { data } = await api.get(`/observaciones/proyecto/${proyecto_id}`);
    return data;
  },

  obtener_por_estudiante: async (): Promise<Observacion[]> => {
    const { data } = await api.get('/observaciones/por-estudiante');
    return data;
  },

  obtener_por_asesor: async (): Promise<Observacion[]> => {
    const { data } = await api.get('/observaciones/mias');
    return data;
  },

  actualizar: async (id: number, datos: any): Promise<Observacion> => {
    const { data } = await api.patch(`/observaciones/${id}`, datos);
    return data;
  },

  archivar: async (id: number): Promise<Observacion> => {
    const { data } = await api.patch(`/observaciones/${id}/archivar`);
    return data;
  },

  restaurar: async (id: number): Promise<Observacion> => {
    const { data } = await api.patch(`/observaciones/${id}/restaurar`);
    return data;
  },

  cambiar_estado: async (id: number, estado: string): Promise<Observacion> => {
    const { data } = await api.patch(`/observaciones/${id}/estado`, { estado });
    return data;
  },
};

export const correcciones = {
  crear: async (correccion: any): Promise<Correccion> => {
    const { data } = await api.post('/correcciones', correccion);
    return data;
  },

  obtener_por_documento: async (documento_id: number): Promise<Correccion[]> => {
    const { data } = await api.get(`/correcciones/por-documento/${documento_id}`);
    return data;
  },

  obtener_por_proyecto: async (proyecto_id: number): Promise<Correccion[]> => {
    const { data } = await api.get(`/correcciones/por-proyecto/${proyecto_id}`);
    return data;
  },

  obtener_por_estudiante: async (): Promise<Correccion[]> => {
    const { data } = await api.get('/correcciones/por-estudiante');
    return data;
  },

  actualizar: async (id: number, datos: any): Promise<Correccion> => {
    const { data } = await api.patch(`/correcciones/${id}`, datos);
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/correcciones/${id}`);
  },

  marcar_completada: async (observacion_id: number, datos: any): Promise<Correccion> => {
    const { data } = await api.patch(`/correcciones/${observacion_id}/marcar`, datos);
    return data;
  },

  verificar: async (observacion_id: number, datos: any): Promise<any> => {
    const { data } = await api.patch(`/correcciones/${observacion_id}/verificar`, datos);
    return data;
  },
};

export const grupos = {
  obtener_todos: async (): Promise<Grupo[]> => {
    const { data } = await api.get('/grupos');
    return data;
  },

  obtener_disponibles: async (): Promise<Grupo[]> => {
    const { data } = await api.get('/grupos/disponibles');
    return data;
  },

  obtener_mi_grupo: async (): Promise<Grupo> => {
    const { data } = await api.get('/grupos/mi-grupo');
    return data;
  },

  obtener_por_id: async (id: number): Promise<Grupo> => {
    const { data } = await api.get(`/grupos/${id}`);
    return data;
  },

  obtener_por_periodo: async (periodo_id: number): Promise<Grupo[]> => {
    const { data } = await api.get(`/grupos/periodo/${periodo_id}`);
    return data;
  },

  crear: async (grupo: any): Promise<Grupo> => {
    const { data } = await api.post('/grupos', grupo);
    return data;
  },

  actualizar: async (id: number, grupo: any): Promise<Grupo> => {
    const { data } = await api.patch(`/grupos/${id}`, grupo);
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/grupos/${id}`);
  },

  inscribirse: async (id: number): Promise<any> => {
    const { data } = await api.post(`/grupos/${id}/inscribirse`);
    return data;
  },

  desinscribirse: async (id: number): Promise<any> => {
    const { data } = await api.delete(`/grupos/${id}/desinscribirse`);
    return data;
  },

  asignar_estudiante: async (id: number, estudiante_id: number): Promise<Grupo> => {
    const { data } = await api.post(`/grupos/${id}/asignar-estudiante`, { id_estudiante: estudiante_id });
    return data;
  },

  remover_estudiante: async (id: number, estudiante_id: number): Promise<Grupo> => {
    const { data } = await api.delete(`/grupos/${id}/remover-estudiante/${estudiante_id}`);
    return data;
  },
};

export const periodos = {
  obtener_todos: async (): Promise<Periodo[]> => {
    const { data } = await api.get('/periodos');
    return data;
  },

  obtener_activo: async (): Promise<Periodo> => {
    const { data } = await api.get('/periodos/activo');
    return data;
  },

  obtener_por_id: async (id: number): Promise<Periodo> => {
    const { data } = await api.get(`/periodos/${id}`);
    return data;
  },

  crear: async (periodo: any): Promise<Periodo> => {
    const { data } = await api.post('/periodos', periodo);
    return data;
  },

  actualizar: async (id: number, periodo: any): Promise<Periodo> => {
    const { data } = await api.patch(`/periodos/${id}`, periodo);
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/periodos/${id}`);
  },
};

export const solicitudes_registro = {
  crear: async (solicitud: any): Promise<SolicitudRegistro> => {
    const { data } = await api.post('/solicitudes-registro', solicitud);
    return data;
  },

  obtener_todas: async (): Promise<SolicitudRegistro[]> => {
    const { data } = await api.get('/solicitudes-registro');
    return data;
  },

  obtener_pendientes: async (): Promise<SolicitudRegistro[]> => {
    const { data } = await api.get('/solicitudes-registro/pendientes');
    return data;
  },

  responder: async (id: number, respuesta: any): Promise<SolicitudRegistro> => {
    const { data } = await api.patch(`/solicitudes-registro/${id}/responder`, respuesta);
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/solicitudes-registro/${id}`);
  },
};

export const asesores = {
  obtener_todos: async (): Promise<Usuario[]> => {
    const { data } = await api.get('/asesores');
    return data;
  },
};

export const administracion = {
  obtener_todos_usuarios: async (): Promise<Usuario[]> => {
    const { data } = await api.get('/administracion/usuarios');
    return data;
  },

  obtener_estudiantes: async (): Promise<any[]> => {
    const { data } = await api.get('/administracion/estudiantes');
    return data;
  },

  obtener_estudiantes_sin_grupo: async (): Promise<any[]> => {
    const { data } = await api.get('/administracion/estudiantes/sin-grupo');
    return data;
  },

  obtener_estadisticas: async (): Promise<any> => {
    const { data } = await api.get('/administracion/estadisticas');
    return data;
  },

  cambiar_estado_usuario: async (id_usuario: number, estado: string): Promise<Usuario> => {
    const { data } = await api.patch(`/administracion/usuarios/${id_usuario}/cambiar-estado`, { estado });
    return data;
  },
};

export default api;