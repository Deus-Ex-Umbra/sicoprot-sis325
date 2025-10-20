import { Navbar, Nav, NavDropdown, Container, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { FaUser, FaSignOutAlt, FaBars, FaCog, FaUsers } from 'react-icons/fa';
import { Rol } from '../tipos/usuario';

interface Props {
  toggleSidebar: () => void;
}

const Cabecera: React.FC<Props> = ({ toggleSidebar }) => {
  const { usuario, cerrarSesion } = useAutenticacion();
  const navigate = useNavigate();

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navigate('/iniciar-sesion');
  };

  const esEstudiante = usuario?.rol === Rol.Estudiante;
  const tieneGrupo = esEstudiante && usuario?.perfil?.grupo !== undefined && usuario?.perfil?.grupo !== null;

  return (
    <Navbar className="navbar" expand="lg" variant="dark">
      <Container fluid>
        <Nav.Link onClick={toggleSidebar} className="text-light me-3">
          <FaBars size={20} />
        </Nav.Link>
        
        <Navbar.Brand href="#" className="text-light fw-bold">
          SICOPROT
        </Navbar.Brand>

        {tieneGrupo && usuario?.perfil?.grupo && (
          <Badge 
            bg="info" 
            className="ms-3 d-none d-md-flex align-items-center"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/panel/inscripcion-grupos')}
          >
            <FaUsers className="me-1" />
            {usuario.perfil.grupo.nombre}
          </Badge>
        )}
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            {tieneGrupo && usuario?.perfil?.grupo && (
              <Nav.Item className="d-md-none mb-2">
                <Badge 
                  bg="info" 
                  className="w-100 p-2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/panel/inscripcion-grupos')}
                >
                  <FaUsers className="me-2" />
                  Grupo: {usuario.perfil.grupo.nombre}
                </Badge>
              </Nav.Item>
            )}
            
            <NavDropdown 
              title={
                <span className="text-light">
                  <FaUser className="me-2" />
                  {usuario?.perfil ? `${usuario.perfil.nombre} ${usuario.perfil.apellido}` : usuario?.correo}
                </span>
              }
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item disabled>
                <small className="text-muted">Rol: {usuario?.rol}</small>
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={() => navigate('/panel/perfil')}>
                <FaCog className="me-2" />
                Mi Perfil
              </NavDropdown.Item>
              {tieneGrupo && (
                <>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={() => navigate('/panel/inscripcion-grupos')}>
                    <FaUsers className="me-2" />
                    Mi Grupo
                  </NavDropdown.Item>
                </>
              )}
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={manejarCerrarSesion}>
                <FaSignOutAlt className="me-2" />
                Cerrar Sesión
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Cabecera;