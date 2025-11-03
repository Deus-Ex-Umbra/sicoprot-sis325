import { createBrowserRouter, Navigate } from 'react-router-dom';
import IniciarSesion from '../paginas/auth/IniciarSesion';
import Registro from '../paginas/auth/Registro';
import Panel from '../paginas/Panel';
import Perfil from '../paginas/Perfil';
import Configuracion from '../paginas/Configuracion';
import Proyectos from '../paginas/Proyectos';
import DetalleProyecto from '../paginas/DetalleProyecto';
import MisDocumentos from '../paginas/estudiante/MisDocumentos';
import Observaciones from '../paginas/estudiante/Observaciones';
import ObservacionesAsesor from '../paginas/asesor/ObservacionesAsesor';
import MisEstudiantes from '../paginas/asesor/MisEstudiantes';
import RevisarDocumentos from '../paginas/asesor/RevisarDocumentos';
import InscripcionGrupos from '../paginas/estudiante/InscripcionGrupos';
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
    path: 'iniciar-sesion',
    element: <IniciarSesion />,
  },
  {
    path: 'registrarse',
    element: <Registro />,
  },
  {
    path: '/panel',
    element: (
      <RutaProtegida>
        <Panel />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/perfil',
    element: (
      <RutaProtegida>
        <Perfil />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/configuracion',
    element: (
      <RutaProtegida>
        <Configuracion />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/proyectos',
    element: (
      <RutaProtegida>
        <Proyectos />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/proyecto/:id',
    element: (
      <RutaProtegida>
        <DetalleProyecto />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/proyecto/:proyectoId/crear-observacion',
    element: (
      <RutaProtegida roles_permitidos={[Rol.Asesor]}>
        <CrearObservacion />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/proyecto/:proyectoId/crear-correccion',
    element: (
      <RutaProtegida roles_permitidos={[Rol.Estudiante]}>
        <CrearCorreccion />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/inscripcion-grupos',
    element: (
      <RutaProtegida roles_permitidos={[Rol.Estudiante]}>
        <InscripcionGrupos />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/mis-documentos',
    element: (
      <RutaProtegida roles_permitidos={[Rol.Estudiante]}>
        <MisDocumentos />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/observaciones',
    element: (
      <RutaProtegida roles_permitidos={[Rol.Estudiante]}>
        <Observaciones />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/gestion-observaciones',
    element: (
      <RutaProtegida roles_permitidos={[Rol.Asesor]}>
        <ObservacionesAsesor />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/estudiantes',
    element: (
      <RutaProtegida roles_permitidos={[Rol.Asesor]}>
        <MisEstudiantes />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/revisar',
    element: (
      <RutaProtegida roles_permitidos={[Rol.Asesor]}>
        <RevisarDocumentos />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/admin',
    element: (
      <RutaProtegida roles_permitidos={[Rol.Administrador]}>
        <DashboardAdmin />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/admin/usuarios',
    element: (
      <RutaProtegida roles_permitidos={[Rol.Administrador]}>
        <GestionUsuarios />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/admin/solicitudes',
    element: (
      <RutaProtegida roles_permitidos={[Rol.Administrador]}>
        <SolicitudesRegistro />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/admin/periodos',
    element: (
      <RutaProtegida roles_permitidos={[Rol.Administrador]}>
        <GestionPeriodos />
      </RutaProtegida>
    ),
  },
  {
    path: '/panel/admin/grupos',
    element: (
      <RutaProtegida roles_permitidos={[Rol.Administrador]}>
        <GestionGrupos />
      </RutaProtegida>
    ),
  },
]);

export default router;