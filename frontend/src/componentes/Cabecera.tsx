import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { FaUser, FaSignOutAlt, FaBars } from 'react-icons/fa';

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

  return (
    <Navbar className="navbar" expand="lg" variant="dark">
      <Container fluid>
        <Nav.Link onClick={toggleSidebar} className="text-light me-3">
          <FaBars size={20} />
        </Nav.Link>
        
        <Navbar.Brand href="#" className="text-light fw-bold">
          SICOPROT
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
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