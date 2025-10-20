import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Cabecera from '../componentes/Cabecera';
import BarraLateral from '../componentes/BarraLateral';
import BarraLateralAdmin from '../componentes/BarraLateralAdmin';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { Rol } from '../tipos/usuario';

const LayoutPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { usuario } = useAutenticacion();

  const esAdmin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="wrapper">
      <Cabecera toggleSidebar={toggleSidebar} />
      {esAdmin ? (
        <BarraLateralAdmin isOpen={sidebarOpen} />
      ) : (
        <BarraLateral isOpen={sidebarOpen} />
      )}

      <div 
        className="content-wrapper" 
        style={{ 
          marginLeft: sidebarOpen ? '250px' : '0', 
          transition: 'margin-left 0.3s ease' 
        }}
      >
        <section className="content">
          <div className="container-fluid pt-3">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
};

export default LayoutPanel;