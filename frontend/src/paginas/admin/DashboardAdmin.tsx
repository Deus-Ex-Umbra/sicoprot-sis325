import { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaUserGraduate, FaChalkboardTeacher, FaLayerGroup, FaCalendarAlt, FaUserClock } from 'react-icons/fa';
import { obtenerEstadisticas } from '../../servicios/administracion.servicio';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const data = await obtenerEstadisticas();
      setEstadisticas(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-light">Panel de Administración</h1>
      
      <Row className="g-4">
        <Col md={6} lg={4}>
          <Card 
            className="text-center h-100" 
            style={{ cursor: 'pointer', backgroundColor: 'var(--color-fondo-tarjeta)' }}
            onClick={() => navigate('/panel/admin/usuarios')}
          >
            <Card.Body>
              <FaUsers size={40} className="mb-3 text-primary" />
              <h5 className="text-light">Gestión de Usuarios</h5>
              <p className="text-muted">
                {estadisticas?.total_usuarios || 0} usuarios totales
              </p>
              <p className="text-muted small">
                {estadisticas?.usuarios_activos || 0} activos
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card 
            className="text-center h-100"
            style={{ cursor: 'pointer', backgroundColor: 'var(--color-fondo-tarjeta)' }}
            onClick={() => navigate('/panel/admin/solicitudes')}
          >
            <Card.Body>
              <FaUserClock size={40} className="mb-3 text-warning" />
              <h5 className="text-light">Solicitudes de Registro</h5>
              <p className="text-muted">
                {estadisticas?.usuarios_pendientes || 0} pendientes
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card 
            className="text-center h-100"
            style={{ cursor: 'pointer', backgroundColor: 'var(--color-fondo-tarjeta)' }}
            onClick={() => navigate('/panel/admin/grupos')}
          >
            <Card.Body>
              <FaLayerGroup size={40} className="mb-3 text-success" />
              <h5 className="text-light">Gestión de Grupos</h5>
              <p className="text-muted">Administrar grupos de trabajo</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card 
            className="text-center h-100"
            style={{ cursor: 'pointer', backgroundColor: 'var(--color-fondo-tarjeta)' }}
            onClick={() => navigate('/panel/admin/periodos')}
          >
            <Card.Body>
              <FaCalendarAlt size={40} className="mb-3 text-info" />
              <h5 className="text-light">Gestión de Períodos</h5>
              <p className="text-muted">Administrar semestres</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card 
            className="text-center h-100"
            style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}
          >
            <Card.Body>
              <FaUserGraduate size={40} className="mb-3 text-danger" />
              <h5 className="text-light">Estudiantes</h5>
              <p className="text-muted">
                {estadisticas?.total_estudiantes || 0} estudiantes
              </p>
              <p className="text-muted small">
                {estadisticas?.estudiantes_sin_grupo || 0} sin grupo
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card 
            className="text-center h-100"
            style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}
          >
            <Card.Body>
              <FaChalkboardTeacher size={40} className="mb-3 text-secondary" />
              <h5 className="text-light">Asesores</h5>
              <p className="text-muted">
                {estadisticas?.total_asesores || 0} asesores
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardAdmin;