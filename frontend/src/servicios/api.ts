import axios from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token_acceso');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token_acceso');
      
      if (window.location.pathname !== '/inicio-sesion' && window.location.pathname !== '/registro') {
        window.location.href = '/inicio-sesion';
      }
    }
    return Promise.reject(error);
  }
);

export const verificarConexion = async (): Promise<boolean> => {
  try {
    await axios.get(`${API_URL}/api`, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
};

export const obtenerUrlFoto = (ruta?: string) => {
  if (!ruta) return undefined;
  if (ruta.startsWith('data:') || ruta.startsWith('http')) {
    return ruta;
  }
  // Asume que la ruta es algo como 'uploads/perfiles/imagen.png'
  // y la API la sirve en '/api/uploads/perfiles/imagen.png'
  return `${api.defaults.baseURL}/${ruta}`;
};

export const autenticacionApi = {
  iniciarSesion: async (credenciales: any) => {
    const respuesta = await api.post('/autenticacion/iniciar-sesion', credenciales);
    return respuesta.data;
  },
  cerrarSesion: async () => {
    const respuesta = await api.post('/autenticacion/cerrar-sesion');
    return respuesta.data;
  },
};

export const solicitudesRegistroApi = {
  crear: async (datos: any) => {
    const respuesta = await api.post('/solicitudes-registro', datos);
    return respuesta.data;
  },
  obtenerTodas: async () => {
    const respuesta = await api.get('/solicitudes-registro');
    return respuesta.data;
  },
  obtenerPendientes: async () => {
    const respuesta = await api.get('/solicitudes-registro/pendientes');
    return respuesta.data;
  },
  obtenerUna: async (id: number) => {
    const respuesta = await api.get(`/solicitudes-registro/${id}`);
    return respuesta.data;
  },
  responder: async (id: number, datos: any) => {
    const respuesta = await api.patch(`/solicitudes-registro/${id}/responder`, datos);
    return respuesta.data;
  },
  eliminar: async (id: number) => {
    const respuesta = await api.delete(`/solicitudes-registro/${id}`);
    return respuesta.data;
  },
};

export const usuariosApi = {
  crear: async (datos: any) => {
    const respuesta = await api.post('/usuarios', datos);
    return respuesta.data;
  },
  obtenerTodos: async () => {
    const respuesta = await api.get('/usuarios');
    return respuesta.data;
  },
  obtenerUno: async (id: number) => {
    const respuesta = await api.get(`/usuarios/${id}`);
    return respuesta.data;
  },
  actualizar: async (id: number, datos: any) => {
    const respuesta = await api.patch(`/usuarios/${id}`, datos);
    return respuesta.data;
  },
  obtenerPerfilActual: async () => {
    const respuesta = await api.get('/usuarios/perfil/actual');
    return respuesta.data;
  },
  actualizarPerfil: async (datos: any) => {
    const respuesta = await api.patch('/usuarios/perfil/actualizar', datos);
    return respuesta.data;
  },
  actualizarFotoPerfil: async (formData: FormData) => {
    const respuesta = await api.patch('/usuarios/perfil/actualizar-foto', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return respuesta.data;
  },
  eliminar: async (id: number) => {
    const respuesta = await api.delete(`/usuarios/${id}`);
    return respuesta.data;
  },
};

export const adminApi = {
  obtenerTodosUsuarios: async () => {
    const respuesta = await api.get('/administracion/usuarios');
    return respuesta.data;
  },
  obtenerEstudiantes: async () => {
    const respuesta = await api.get('/administracion/estudiantes');
    return respuesta.data;
  },
  obtenerEstudiantesSinGrupo: async () => {
    const respuesta = await api.get('/administracion/estudiantes/sin-grupo');
    return respuesta.data;
  },
  obtenerEstadisticas: async () => {
    const respuesta = await api.get('/administracion/estadisticas');
    return respuesta.data;
  },
  cambiarEstadoUsuario: async (id: number, datos: any) => {
    const respuesta = await api.patch(`/administracion/usuarios/${id}/cambiar-estado`, datos);
    return respuesta.data;
  },
};

export const asesoresApi = {
  obtenerTodos: async () => {
    const respuesta = await api.get('/asesores');
    return respuesta.data;
  },
  obtenerEstudiantesDeMiGrupo: async () => {
    const respuesta = await api.get('/asesores/mi-grupo/estudiantes');
    return respuesta.data;
  },
};

export const periodosApi = {
  crear: async (datos: any) => {
    const respuesta = await api.post('/periodos', datos);
    return respuesta.data;
  },
  obtenerTodos: async () => {
    const respuesta = await api.get('/periodos');
    return respuesta.data;
  },
  obtenerActivo: async () => {
    const respuesta = await api.get('/periodos/activo');
    return respuesta.data;
  },
  obtenerUno: async (id: number) => {
    const respuesta = await api.get(`/periodos/${id}`);
    return respuesta.data;
  },
  actualizar: async (id: number, datos: any) => {
    const respuesta = await api.patch(`/periodos/${id}`, datos);
    return respuesta.data;
  },
  eliminar: async (id: number) => {
    const respuesta = await api.delete(`/periodos/${id}`);
    return respuesta.data;
  },
};

export const gruposApi = {
  crear: async (datos: any) => {
    const respuesta = await api.post('/grupos', datos);
    return respuesta.data;
  },
  obtenerTodos: async () => {
    const respuesta = await api.get('/grupos');
    return respuesta.data;
  },
  obtenerDisponibles: async () => {
    const respuesta = await api.get('/grupos/disponibles');
    return respuesta.data;
  },
  obtenerMiGrupo: async () => {
    const respuesta = await api.get('/grupos/mi-grupo');
    return respuesta.data;
  },
  obtenerPorPeriodo: async (periodoId: number) => {
    const respuesta = await api.get(`/grupos/periodo/${periodoId}`);
    return respuesta.data;
  },
  obtenerUno: async (id: number) => {
    const respuesta = await api.get(`/grupos/${id}`);
    return respuesta.data;
  },
  actualizar: async (id: number, datos: any) => {
    const respuesta = await api.patch(`/grupos/${id}`, datos);
    return respuesta.data;
  },
  asignarEstudiante: async (id: number, datos: any) => {
    const respuesta = await api.post(`/grupos/${id}/asignar-estudiante`, datos);
    return respuesta.data;
  },
  inscribirseAGrupo: async (id: number) => {
    const respuesta = await api.post(`/grupos/${id}/inscribirse`);
    return respuesta.data;
  },
  removerEstudiante: async (id: number, estudianteId: number) => {
    const respuesta = await api.delete(`/grupos/${id}/remover-estudiante/${estudianteId}`);
    return respuesta.data;
  },
  desinscribirseDeGrupo: async (id: number) => {
    const respuesta = await api.delete(`/grupos/${id}/desinscribirse`);
    return respuesta.data;
  },
  eliminar: async (id: number) => {
    const respuesta = await api.delete(`/grupos/${id}`);
    return respuesta.data;
  },
};

export const proyectosApi = {
  crear: async (datos: any) => {
    const respuesta = await api.post('/proyectos', datos);
    return respuesta.data;
  },
  obtenerTodos: async () => {
    const respuesta = await api.get('/proyectos');
    return respuesta.data;
  },
  obtenerUno: async (id: number) => {
    const respuesta = await api.get(`/proyectos/${id}`);
    return respuesta.data;
  },
  aprobarEtapa: async (id: number, datos: any) => {
    const respuesta = await api.patch(`/proyectos/${id}/aprobar-etapa`, datos);
    return respuesta.data;
  },
  gestionarTemaPropuesto: async (id: number, datos: any) => {
    const respuesta = await api.patch(`/proyectos/${id}/tema`, datos);
    return respuesta.data;
  },
  obtenerHistorialProgreso: async () => {
    const respuesta = await api.get('/proyectos/historial-progreso');
    return respuesta.data;
  },
  obtenerCronogramaProyecto: async () => {
    const respuesta = await api.get('/proyectos/cronograma');
    return respuesta.data;
  },
  obtenerTimelineCompleto: async () => {
    const respuesta = await api.get('/proyectos/timeline');
    return respuesta.data;
  },
  buscarProyectos: async (params: any) => {
    const respuesta = await api.get('/proyectos/buscar', { params });
    return respuesta.data;
  },
  solicitarDefensa: async (id: number, datos: any) => {
    const respuesta = await api.patch(`/proyectos/${id}/solicitar-defensa`, datos);
    return respuesta.data;
  },
  responderSolicitudDefensa: async (id: number, datos: any) => {
    const respuesta = await api.patch(`/proyectos/${id}/responder-defensa`, datos);
    return respuesta.data;
  },
};

export const documentosApi = {
  subirDocumento: async (proyectoId: number, formData: FormData) => {
    const respuesta = await api.post(`/documentos/subir/${proyectoId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return respuesta.data;
  },
  obtenerArchivoUrl: (id: number) => {
    return `${api.defaults.baseURL}/documentos/${id}/archivo`;
  },
  obtenerArchivoPorRutaUrl: (ruta: string) => {
    return `${api.defaults.baseURL}/documentos/archivo-por-ruta?ruta=${encodeURIComponent(ruta)}`;
  },
};

export const observacionesApi = {
  crear: async (documentoId: number, datos: any) => {
    const respuesta = await api.post(`/observaciones/${documentoId}/crear`, datos);
    return respuesta.data;
  },
  obtenerPorDocumento: async (documentoId: number, params?: any) => {
    const respuesta = await api.get(`/observaciones/por-documento/${documentoId}`, { params });
    return respuesta.data;
  },
  obtenerMias: async () => {
    const respuesta = await api.get('/observaciones/mias');
    return respuesta.data;
  },
  obtenerPorEstudiante: async () => {
    const respuesta = await api.get('/observaciones/por-estudiante');
    return respuesta.data;
  },
  actualizar: async (id: number, datos: any) => {
    const respuesta = await api.patch(`/observaciones/${id}`, datos);
    return respuesta.data;
  },
  archivar: async (id: number) => {
    const respuesta = await api.patch(`/observaciones/${id}/archivar`);
    return respuesta.data;
  },
  restaurar: async (id: number) => {
    const respuesta = await api.patch(`/observaciones/${id}/restaurar`);
    return respuesta.data;
  },
  cambiarEstado: async (id: number, datos: any) => {
    const respuesta = await api.patch(`/observaciones/${id}/estado`, datos);
    return respuesta.data;
  },
  crearCorreccion: async (id: number, datos: any) => {
    const respuesta = await api.post(`/observaciones/${id}/correccion`, datos);
    return respuesta.data;
  },
  marcarCorreccionCompletada: async (id: number, datos: any) => {
    const respuesta = await api.patch(`/observaciones/${id}/correccion/marcar`, datos);
    return respuesta.data;
  },
  verificarCorreccion: async (id: number, datos: any) => {
    const respuesta = await api.patch(`/observaciones/${id}/correccion/verificar`, datos);
    return respuesta.data;
  },
  verificarObservacion: async (id: number, datos: any) => {
    const respuesta = await api.patch(`/observaciones/verificacion/${id}`, datos);
    return respuesta.data;
  },
  obtenerObservacionesPorProyecto: async (proyectoId: number) => {
    const respuesta = await api.get(`/observaciones/proyecto/${proyectoId}`);
    return respuesta.data;
  },
  obtenerEstadisticasPorDocumento: async (documentoId: number) => {
    const respuesta = await api.get(`/observaciones/estadisticas/documento/${documentoId}`);
    return respuesta.data;
  },
  obtenerObservacionesPorRevisor: async (revisorId: number) => {
    const respuesta = await api.get(`/observaciones/revision/${revisorId}`);
    return respuesta.data;
  },
  listarPendientes: async () => {
    const respuesta = await api.get('/observaciones/revision/pendientes');
    return respuesta.data;
  },
  obtenerObservacionPorId: async (id: number) => {
    const respuesta = await api.get(`/observaciones/${id}`);
    return respuesta.data;
  },
  eliminarObservacion: async (id: number) => {
    const respuesta = await api.delete(`/observaciones/${id}`);
    return respuesta.data;
  },
};

export const correccionesApi = {
  crear: async (datos: any) => {
    const respuesta = await api.post('/correcciones', datos);
    return respuesta.data;
  },
  obtenerPorDocumento: async (documentoId: number) => {
    const respuesta = await api.get(`/correcciones/por-documento/${documentoId}`);
    return respuesta.data;
  },
  obtenerPorProyecto: async (proyectoId: number) => {
    const respuesta = await api.get(`/correcciones/por-proyecto/${proyectoId}`);
    return respuesta.data;
  },
  obtenerPorEstudiante: async () => {
    const respuesta = await api.get('/correcciones/por-estudiante');
    return respuesta.data;
  },
  actualizar: async (id: number, datos: any) => {
    const respuesta = await api.patch(`/correcciones/${id}`, datos);
    return respuesta.data;
  },
  eliminar: async (id: number) => {
    const respuesta = await api.delete(`/correcciones/${id}`);
    return respuesta.data;
  },
  marcarCompletada: async (observacionId: number, datos: any) => {
    const respuesta = await api.patch(`/correcciones/${observacionId}/marcar`, datos);
    return respuesta.data;
  },
  verificar: async (observacionId: number, datos: any) => {
    const respuesta = await api.patch(`/correcciones/${observacionId}/verificar`, datos);
    return respuesta.data;
  },
};

export const propuestasTemaApi = {
  crear: async (datos: any) => {
    const respuesta = await api.post('/propuestas-tema', datos);
    return respuesta.data;
  },
  obtenerPorProyecto: async (id_proyecto: number) => {
    const respuesta = await api.get(`/propuestas-tema/proyecto/${id_proyecto}`);
    return respuesta.data;
  },
  responder: async (id_propuesta: number, datos: any) => {
    const respuesta = await api.patch(`/propuestas-tema/${id_propuesta}/responder`, datos);
    return respuesta.data;
  },
  eliminar: async (id_propuesta: number) => {
    const respuesta = await api.delete(`/propuestas-tema/${id_propuesta}`);
    return respuesta.data;
  },
};

export const reunionesApi = {
  crear: async (datos: any) => {
    const respuesta = await api.post('/reuniones', datos);
    return respuesta.data;
  },
  obtenerPorProyecto: async (id_proyecto: number) => {
    const respuesta = await api.get(`/reuniones/proyecto/${id_proyecto}`);
    return respuesta.data;
  },
  obtenerUna: async (id: number) => {
    const respuesta = await api.get(`/reuniones/${id}`);
    return respuesta.data;
  },
  actualizar: async (id: number, datos: any) => {
    const respuesta = await api.patch(`/reuniones/${id}`, datos);
    return respuesta.data;
  },
  eliminar: async (id: number) => {
    const respuesta = await api.delete(`/reuniones/${id}`);
    return respuesta.data;
  },
};