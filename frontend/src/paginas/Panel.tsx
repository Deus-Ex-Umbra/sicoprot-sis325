import { Card, Row, Col } from 'react-bootstrap';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { Rol } from '../tipos/usuario';
import { FaProjectDiagram, FaFileAlt, FaComments, FaUserGraduate } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Panel = () => {
  const { usuario } = useAutenticacion();
  const navigate = useNavigate();
  
  const esEstudiante = usuario?.rol === Rol.Estudiante;
  const esAsesor = usuario?.rol === Rol.Asesor;

  return (
    <div>
      <h1 className="mb-4 text-light">
        ¡Bienvenido, {usuario?.perfil?.nombre || usuario?.correo}!
      </h1>
      
      <Row className="g-4">
        <Col md={6} lg={3}>
          <Card 
            className="text-center h-100" 
            style={{ cursor: 'pointer', backgroundColor: 'var(--color-fondo-tarjeta)' }}
            onClick={() => navigate('/panel/proyectos')}
          >
            <Card.Body>
              <FaProjectDiagram size={40} className="mb-3 text-primary" />
              <h5 className="text-light">Proyectos</h5>
              <p className="text-muted">
                {esEstudiante ? 'Mis proyectos' : 'Proyectos asignados'}
              </p>
            </Card.Body>
          </Card>
        </Col>

        {esEstudiante && (
          <>
            <Col md={6} lg={3}>
              <Card 
                className="text-center h-100"
                style={{ cursor: 'pointer', backgroundColor: 'var(--color-fondo-tarjeta)' }}
                onClick={() => navigate('/panel/mis-documentos')}
              >
                <Card.Body>
                  <FaFileAlt size={40} className="mb-3 text-success" />
                  <h5 className="text-light">Documentos</h5>
                  <p className="text-muted">Subir y gestionar documentos</p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card 
                className="text-center h-100"
                style={{ cursor: 'pointer', backgroundColor: 'var(--color-fondo-tarjeta)' }}
                onClick={() => navigate('/panel/observaciones')}
              >
                <Card.Body>
                  <FaComments size={40} className="mb-3 text-warning" />
                  <h5 className="text-light">Observaciones</h5>
                  <p className="text-muted">Ver observaciones del asesor</p>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}

        {esAsesor && (
          <>
            <Col md={6} lg={3}>
              <Card 
                className="text-center h-100"
                style={{ cursor: 'pointer', backgroundColor: 'var(--color-fondo-tarjeta)' }}
                onClick={() => navigate('/panel/estudiantes')}
              >
                <Card.Body>
                  <FaUserGraduate size={40} className="mb-3 text-info" />
                  <h5 className="text-light">Estudiantes</h5>
                  <p className="text-muted">Lista de estudiantes asignados</p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card 
                className="text-center h-100"
                style={{ cursor: 'pointer', backgroundColor: 'var(--color-fondo-tarjeta)' }}
                onClick={() => navigate('/panel/revisar')}
              >
                <Card.Body>
                  <FaComments size={40} className="mb-3 text-danger" />
                  <h5 className="text-light">Revisar</h5>
                  <p className="text-muted">Documentos pendientes de revisión</p>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
};

export default Panel;