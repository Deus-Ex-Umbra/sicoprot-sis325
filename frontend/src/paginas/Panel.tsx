import { Card, Row, Col, Alert } from 'react-bootstrap';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { Rol } from '../tipos/usuario';
import { FaProjectDiagram, FaFileAlt, FaComments, FaUserGraduate, FaCog, FaUsers, FaChalkboardTeacher, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Panel = () => {
  const { usuario } = useAutenticacion();
  const navigate = useNavigate();

  const esEstudiante = usuario?.rol === Rol.Estudiante;
  const esAsesor = usuario?.rol === Rol.Asesor;
  const esAdmin = usuario?.rol === Rol.Administrador;

  const tieneGrupo = !!(esEstudiante && usuario?.perfil?.grupo);
  const grupo = usuario?.perfil?.grupo;

  if (esAdmin) {
    navigate('/panel/admin');
    return null;
  }

  return (
    <div>
      <h1 className="mb-4 text-light">
        ¡Bienvenido, {usuario?.perfil?.nombre || usuario?.correo}!
      </h1>

      {esEstudiante && !tieneGrupo && (
        <Alert variant="warning" className="mb-4">
          <FaExclamationTriangle className="me-2" />
          <strong>Importante:</strong> No estás inscrito en ningún grupo de asesoría.
          Para crear proyectos y recibir orientación, debes inscribirte en un grupo.
          <div className="mt-2">
            <button
              className="btn btn-warning btn-sm"
              onClick={() => navigate('/panel/inscripcion-grupos')}
            >
              <FaUsers className="me-2" />
              Inscribirme a un Grupo
            </button>
          </div>
        </Alert>
      )}

      {esEstudiante && tieneGrupo && grupo && (
        <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }} className="mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <h5 className="text-light mb-2">
                  <FaUsers className="me-2 text-info" />
                  Tu Grupo de Asesoría
                </h5>
                <div className="ms-4">
                  <p className="mb-1 text-light">
                    <strong>Grupo:</strong> {grupo.nombre}
                  </p>
                  {grupo.descripcion && (
                    <p className="mb-1 text-muted small">
                      {grupo.descripcion}
                    </p>
                  )}
                  {grupo.asesor && (
                    <p className="mb-0 text-light">
                      <FaChalkboardTeacher className="me-2 text-success" />
                      <strong>Asesor:</strong> {grupo.asesor.nombre} {grupo.asesor.apellido}
                    </p>
                  )}
                </div>
              </Col>
              <Col md={4} className="text-end">
                <button
                  className="btn btn-outline-info"
                  onClick={() => navigate('/panel/inscripcion-grupos')}
                >
                  Ver Detalles
                </button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

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
                onClick={() => navigate('/panel/inscripcion-grupos')}
              >
                <Card.Body>
                  <FaUsers size={40} className="mb-3 text-info" />
                  <h5 className="text-light">Grupos</h5>
                  <p className="text-muted">
                    {tieneGrupo ? 'Gestionar mi grupo' : 'Inscripción a grupos'}
                  </p>
                </Card.Body>
              </Card>
            </Col>

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