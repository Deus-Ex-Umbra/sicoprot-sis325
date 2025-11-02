import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { autenticacionApi, usuariosApi } from '../servicios/api';
import { type Usuario } from '../tipos/usuario';

interface ContextoAutenticacionTipo {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
  cerrarSesion: () => void;
  estaAutenticado: () => boolean;
  actualizarUsuario: (usuario_actualizado: Usuario) => void;
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
    const verificarUsuario = async () => {
      const token_guardado = localStorage.getItem('token_acceso');
      const usuario_guardado = localStorage.getItem('usuario');

      if (token_guardado && usuario_guardado) {
        try {
          const usuario_parseado = JSON.parse(usuario_guardado);
          setToken(token_guardado);
          setUsuario(usuario_parseado);
          await usuariosApi.obtenerPerfilActual(); 
        } catch (error) {
          console.error("Error al verificar autenticación", error);
          cerrarSesion();
        }
      }
      setCargando(false);
    };

    verificarUsuario();
  }, []);

  const iniciarSesion = async (correo: string, contrasena: string) => {
    try {
      const respuesta = await autenticacionApi.iniciarSesion({
        correo,
        contrasena,
      });

      const { token_acceso, usuario: datos_usuario } = respuesta;

      localStorage.setItem('token_acceso', token_acceso);
      localStorage.setItem('usuario', JSON.stringify(datos_usuario));

      setToken(token_acceso);
      setUsuario(datos_usuario);
    } catch (error) {
      cerrarSesion();
      throw error;
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token_acceso');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  };

  const estaAutenticado = () => {
    return !!token;
  };

  const actualizarUsuario = (usuario_actualizado: Usuario) => {
    setUsuario(usuario_actualizado);
    localStorage.setItem('usuario', JSON.stringify(usuario_actualizado));
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