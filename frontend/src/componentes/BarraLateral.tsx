import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { Rol } from '../tipos/usuario';
import { 
  FaHome, 
  FaProjectDiagram, 
  FaFileAlt, 
  FaComments,
  FaUserGraduate,
  FaChalkboardTeacher 
} from 'react-icons/fa';

interface Props {
  isOpen: boolean;
}

const BarraLateral: React.FC<Props> = ({ isOpen }) => {
  const { usuario } = useAutenticacion();

  const esEstudiante = usuario?.rol === Rol.Estudiante;
  const esAsesor = usuario?.rol === Rol.Asesor;
  const esAdmin = usuario?.rol === Rol.Administrador;

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
            to="/panel" 
            className={({ isActive }) => 
              `nav-link d-flex align-items-center ${isActive ? 'active text-primary' : 'text-light'}`
            }
          >
            <FaHome className="me-2" />
            Inicio
          </NavLink>
        </Nav.Item>

        <Nav.Item className="mb-2">
          <NavLink 
            to="/panel/proyectos" 
            className={({ isActive }) => 
              `nav-link d-flex align-items-center ${isActive ? 'active text-primary' : 'text-light'}`
            }
          >
            <FaProjectDiagram className="me-2" />
            Proyectos
          </NavLink>
        </Nav.Item>

        {esEstudiante && (
          <>
            <Nav.Item className="mb-2">
              <NavLink 
                to="/panel/mis-documentos" 
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center ${isActive ? 'active text-primary' : 'text-light'}`
                }
              >
                <FaFileAlt className="me-2" />
                Mis Documentos
              </NavLink>
            </Nav.Item>

            <Nav.Item className="mb-2">
              <NavLink 
                to="/panel/observaciones" 
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center ${isActive ? 'active text-primary' : 'text-light'}`
                }
              >
                <FaComments className="me-2" />
                Observaciones
              </NavLink>
            </Nav.Item>
          </>
        )}

        {esAsesor && (
          <>
            <Nav.Item className="mb-2">
              <NavLink 
                to="/panel/estudiantes" 
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center ${isActive ? 'active text-primary' : 'text-light'}`
                }
              >
                <FaUserGraduate className="me-2" />
                Mis Estudiantes
              </NavLink>
            </Nav.Item>

            <Nav.Item className="mb-2">
              <NavLink 
                to="/panel/revisar" 
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center ${isActive ? 'active text-primary' : 'text-light'}`
                }
              >
                <FaChalkboardTeacher className="me-2" />
                Revisar Documentos
              </NavLink>
            </Nav.Item>
          </>
        )}

        {esAdmin && (
          <Nav.Item className="mb-2">
            <NavLink 
              to="/panel/administracion" 
              className={({ isActive }) => 
                `nav-link d-flex align-items-center ${isActive ? 'active text-primary' : 'text-light'}`
              }
            >
              <FaChalkboardTeacher className="me-2" />
              Administración
            </NavLink>
          </Nav.Item>
        )}
      </Nav>
    </div>
  );
};

export default BarraLateral;