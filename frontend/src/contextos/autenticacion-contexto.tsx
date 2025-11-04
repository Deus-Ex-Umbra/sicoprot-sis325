import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { autenticacionApi, usuariosApi } from '../servicios/api';
import { type Usuario } from '../tipos/usuario';

interface ContextoAutenticacionTipo {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
  cerrarSesion: () => void;
  estaAutenticado: () => boolean;
  actualizarUsuario: (usuario_actualizado: Partial<Usuario>) => void;
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
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const verificarUsuario = async () => {
      const token_guardado = localStorage.getItem('token_acceso');

      if (!token_guardado) {
        setCargando(false);
        return;
      }

      try {
        const datos_usuario = await usuariosApi.obtenerPerfilActual();
        setUsuario(datos_usuario);
      } catch (error) {
        cerrarSesion();
      } finally {
        setCargando(false);
      }
    };

    verificarUsuario();
  }, []);

  const iniciarSesion = async (correo: string, contrasena: string) => {
    try {
      const respuesta = await autenticacionApi.iniciarSesion({ correo, contrasena });
      const { token_acceso, usuario: datos_usuario } = respuesta;

      localStorage.setItem('token_acceso', token_acceso);
      setUsuario(datos_usuario);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        throw new Error('Correo o contraseña incorrectos.');
      }
      throw new Error('Error al iniciar sesión. Intenta nuevamente.');
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token_acceso');
    setUsuario(null);
  };

  const estaAutenticado = () => !!usuario;

  const actualizarUsuario = (usuario_actualizado: Partial<Usuario>) => {
    setUsuario(prev => {
      if (!prev) return null;

      const nuevo_perfil = usuario_actualizado.perfil
        ? {
            ...prev.perfil,
            ...usuario_actualizado.perfil,
          }
        : prev.perfil;

      return {
        ...prev,
        ...usuario_actualizado,
        perfil: nuevo_perfil,
      };
    });
  };

  return (
    <ContextoAutenticacion.Provider
      value={{
        usuario,
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