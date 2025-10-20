import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaUserClock, 
  FaCalendarAlt,
  FaLayerGroup
} from 'react-icons/fa';

interface Props {
  isOpen: boolean;
}

const BarraLateralAdmin: React.FC<Props> = ({ isOpen }) => {
  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`} 
         style={{
           position: 'fixed',
           top: '56px',
           left: isOpen ? 0 : '-250px',
           width: '250px',
           height: 'calc(100vh - 56px)',
           backgroundColor: 'var(--color-fondo-secundario)',
           borderRight: '1px solid var(--color-borde)',
           transition: 'left 0.3s ease',
           zIndex: 1000,
           overflowY: 'auto'
         }}>
      <Nav className="flex-column p-3">
        <Nav.Item className="mb-2">
          <NavLink 
            to="/panel/admin" 
            end
            className={({ isActive }) => 
              `nav-link d-flex align-items-center ${isActive ? 'active text-primary' : 'text-light'}`
            }
          >
            <FaHome className="me-2" />
            Panel de Administración
          </NavLink>
        </Nav.Item>

        <Nav.Item className="mb-2">
          <NavLink 
            to="/panel/admin/usuarios" 
            className={({ isActive }) => 
              `nav-link d-flex align-items-center ${isActive ? 'active text-primary' : 'text-light'}`
            }
          >
            <FaUsers className="me-2" />
            Gestión de Usuarios
          </NavLink>
        </Nav.Item>

        <Nav.Item className="mb-2">
          <NavLink 
            to="/panel/admin/solicitudes" 
            className={({ isActive }) => 
              `nav-link d-flex align-items-center ${isActive ? 'active text-primary' : 'text-light'}`
            }
          >
            <FaUserClock className="me-2" />
            Solicitudes de Registro
          </NavLink>
        </Nav.Item>

        <Nav.Item className="mb-2">
          <NavLink 
            to="/panel/admin/periodos" 
            className={({ isActive }) => 
              `nav-link d-flex align-items-center ${isActive ? 'active text-primary' : 'text-light'}`
            }
          >
            <FaCalendarAlt className="me-2" />
            Gestión de Períodos
          </NavLink>
        </Nav.Item>

        <Nav.Item className="mb-2">
          <NavLink 
            to="/panel/admin/grupos" 
            className={({ isActive }) => 
              `nav-link d-flex align-items-center ${isActive ? 'active text-primary' : 'text-light'}`
            }
          >
            <FaLayerGroup className="me-2" />
            Gestión de Grupos
          </NavLink>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default BarraLateralAdmin;