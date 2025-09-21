import { Navigate, useLocation } from 'react-router-dom';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { Rol } from '../tipos/usuario';

interface Props {
  children: React.ReactNode;
  roles_permitidos?: Rol[];
}

const RutaProtegida: React.FC<Props> = ({ children, roles_permitidos }) => {
  const { usuario, cargando, estaAutenticado } = useAutenticacion();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!estaAutenticado()) {
    return <Navigate to="/iniciar-sesion" state={{ from: location }} replace />;
  }

  if (roles_permitidos && usuario && !roles_permitidos.includes(usuario.rol)) {
    return <Navigate to="/panel" replace />;
  }

  return <>{children}</>;
};

export default RutaProtegida;