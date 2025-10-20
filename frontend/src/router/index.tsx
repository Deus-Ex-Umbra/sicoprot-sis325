import { createBrowserRouter, Navigate } from 'react-router-dom';
import LayoutAutenticacion from '../layouts/LayoutAutenticacion';
import LayoutPanel from '../layouts/LayoutPanel';
import IniciarSesion from '../paginas/IniciarSesion';
import Registro from '../paginas/Registro';
import Panel from '../paginas/Panel';
import Perfil from '../paginas/Perfil';
import Proyectos from '../paginas/Proyectos';
import DetalleProyecto from '../paginas/DetalleProyecto';
import MisDocumentos from '../paginas/MisDocumentos';
import Observaciones from '../paginas/Observaciones';
import ObservacionesAsesor from '../paginas/ObservacionesAsesor';
import MisEstudiantes from '../paginas/MisEstudiantes';
import RevisarDocumentos from '../paginas/RevisarDocumentos';
import RutaProtegida from '../componentes/RutaProtegida';
import CrearObservacion from '../paginas/CrearObservacion';
import CrearCorreccion from '../paginas/CrearCorreccion';
import DashboardAdmin from '../paginas/admin/DashboardAdmin';
import GestionUsuarios from '../paginas/admin/GestionUsuarios';
import SolicitudesRegistro from '../paginas/admin/SolicitudesRegistro';
import GestionPeriodos from '../paginas/admin/GestionPeriodos';
import GestionGrupos from '../paginas/admin/GestionGrupos';
import { Rol } from '../tipos/usuario';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/panel" replace />,
  },
  {
    path: '/',
    element: <LayoutAutenticacion />,
    children: [
      {
        path: 'iniciar-sesion',
        element: <IniciarSesion />,
      },
      {
        path: 'registrarse',
        element: <Registro />,
      },
    ],
  },
  {
    path: '/panel',
    element: (
      <RutaProtegida>
        <LayoutPanel />
      </RutaProtegida>
    ),
    children: [
      {
        index: true,
        element: <Panel />,
      },
      {
        path: 'perfil',
        element: <Perfil />,
      },
      {
        path: 'proyectos',
        element: <Proyectos />,
      },
      {
        path: 'proyecto/:id',
        element: <DetalleProyecto />,
      },
      {
        path: 'proyecto/:proyectoId/crear-observacion',
        element: (
          <RutaProtegida roles_permitidos={[Rol.Asesor]}>
            <CrearObservacion />
          </RutaProtegida>
        ),
      },
      {
        path: 'proyecto/:proyectoId/crear-correccion',
        element: (
          <RutaProtegida roles_permitidos={[Rol.Estudiante]}>
            <CrearCorreccion />
          </RutaProtegida>
        ),
      },
      {
        path: 'mis-documentos',
        element: (
          <RutaProtegida roles_permitidos={[Rol.Estudiante]}>
            <MisDocumentos />
          </RutaProtegida>
        ),
      },
      {
        path: 'observaciones',
        element: (
          <RutaProtegida roles_permitidos={[Rol.Estudiante]}>
            <Observaciones />
          </RutaProtegida>
        ),
      },
      {
        path: 'gestion-observaciones',
        element: (
          <RutaProtegida roles_permitidos={[Rol.Asesor]}>
            <ObservacionesAsesor />
          </RutaProtegida>
        ),
      },
      {
        path: 'estudiantes',
        element: (
          <RutaProtegida roles_permitidos={[Rol.Asesor]}>
            <MisEstudiantes />
          </RutaProtegida>
        ),
      },
      {
        path: 'revisar',
        element: (
          <RutaProtegida roles_permitidos={[Rol.Asesor]}>
            <RevisarDocumentos />
          </RutaProtegida>
        ),
      },
      {
        path: 'admin',
        element: (
          <RutaProtegida roles_permitidos={[Rol.Administrador]}>
            <DashboardAdmin />
          </RutaProtegida>
        ),
      },
      {
        path: 'admin/usuarios',
        element: (
          <RutaProtegida roles_permitidos={[Rol.Administrador]}>
            <GestionUsuarios />
          </RutaProtegida>
        ),
      },
      {
        path: 'admin/solicitudes',
        element: (
          <RutaProtegida roles_permitidos={[Rol.Administrador]}>
            <SolicitudesRegistro />
          </RutaProtegida>
        ),
      },
      {
        path: 'admin/periodos',
        element: (
          <RutaProtegida roles_permitidos={[Rol.Administrador]}>
            <GestionPeriodos />
          </RutaProtegida>
        ),
      },
      {
        path: 'admin/grupos',
        element: (
          <RutaProtegida roles_permitidos={[Rol.Administrador]}>
            <GestionGrupos />
          </RutaProtegida>
        ),
      },
    ],
  },
]);

export default router;