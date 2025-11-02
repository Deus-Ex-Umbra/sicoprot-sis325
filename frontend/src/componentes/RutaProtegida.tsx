import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { Rol } from '../tipos/usuario';

interface RutaProtegidaProps {
  children: React.ReactNode;
  roles_permitidos?: Rol[];
}

const RutaProtegida = ({ children, roles_permitidos }: RutaProtegidaProps) => {
  const { usuario, cargando, estaAutenticado } = useAutenticacion();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
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