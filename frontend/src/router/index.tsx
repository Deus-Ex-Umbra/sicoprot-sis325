import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import IniciarSesion from '../pages/IniciarSesion';
import Registro from '../pages/Registro';
import Dashboard from '../pages/Dashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: '/iniciar-sesion',
        element: <IniciarSesion />,
      },
      {
        path: '/registrarse',
        element: <Registro />,
      },
    ],
  },
  {
    path: '/panel',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      }
    ]
  }
]);

export default router;