import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import api from '../servicios/api';
import { type Usuario } from '../tipos/usuario';

interface ContextoAutenticacionTipo {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
  cerrarSesion: () => void;
  estaAutenticado: () => boolean;
  actualizarUsuario: (usuarioActualizado: Usuario) => void;
}

const ContextoAutenticacion = createContext<ContextoAutenticacionTipo | undefined>(undefined);

export const useAutenticacion = () => {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) {
    throw new Error('useAutenticacion debe usarse dentro de un ProveedorAutenticacion');
  }
  return contexto;
};

interface Props {
  children: ReactNode;
}

export const ProveedorAutenticacion: React.FC<Props> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token_guardado = localStorage.getItem('token');
    const usuario_guardado = localStorage.getItem('usuario');

    if (token_guardado && usuario_guardado) {
      try {
        const usuario_parseado = JSON.parse(usuario_guardado);
        setToken(token_guardado);
        setUsuario(usuario_parseado);
        api.defaults.headers.common['Authorization'] = `Bearer ${token_guardado}`;
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }

    setCargando(false);
  }, []);

  const iniciarSesion = async (correo: string, contrasena: string) => {
    try {
      const response = await api.post('/autenticacion/iniciar-sesion', {
        correo,
        contrasena,
      });

      const { token_acceso, usuario: datos_usuario } = response.data;

      localStorage.setItem('token', token_acceso);
      localStorage.setItem('usuario', JSON.stringify(datos_usuario));

      api.defaults.headers.common['Authorization'] = `Bearer ${token_acceso}`;

      setToken(token_acceso);
      setUsuario(datos_usuario);
    } catch (error) {
      throw error;
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUsuario(null);
  };

  const estaAutenticado = () => {
    return !!token;
  };

  const actualizarUsuario = (usuarioActualizado: Usuario) => {
    setUsuario(usuarioActualizado);
    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
  };

  return (
    <ContextoAutenticacion.Provider
      value={{
        usuario,
        token,
        cargando,
        iniciarSesion,
        cerrarSesion,
        estaAutenticado,
        actualizarUsuario,
      }}
    >
      {children}
    </ContextoAutenticacion.Provider>
  );
};