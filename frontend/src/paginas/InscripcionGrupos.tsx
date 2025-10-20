import { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Alert, ListGroup } from 'react-bootstrap';
import { FaUserPlus, FaUserMinus, FaUsers, FaChalkboardTeacher, FaCalendar } from 'react-icons/fa';
import { obtenerGruposDisponibles, inscribirseAGrupo, desinscribirseDeGrupo } from '../servicios/grupos.servicio';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { type Grupo } from '../tipos/usuario';
import { toast } from 'react-toastify';

const InscripcionGrupos = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const { usuario } = useAutenticacion();

  const mi_grupo = usuario?.perfil?.grupo;

  useEffect(() => {
    cargarGrupos();
  }, []);

  const cargarGrupos = async () => {
    try {
      const data = await obtenerGruposDisponibles();
      setGrupos(data);
    } catch (err) {
      setError('Error al cargar los grupos disponibles');
    } finally {
      setCargando(false);
    }
  };

  const manejarInscripcion = async (grupoId: number) => {
    if (procesando) return;
    
    setProcesando(true);
    
    try {
      await inscribirseAGrupo(grupoId);
      toast.success('¡Te has inscrito exitosamente al grupo!');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al inscribirse al grupo';
      toast.error(mensaje);
      setProcesando(false);
    }
  };

  const manejarDesinscripcion = async () => {
    if (!mi_grupo || procesando) return;
    
    if (!window.confirm('¿Estás seguro de que deseas desinscribirte de este grupo?')) {
      return;
    }

    setProcesando(true);

    try {
      await desinscribirseDeGrupo(mi_grupo.id);
      toast.success('Te has desinscrito exitosamente del grupo.');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al desinscribirse del grupo';
      toast.error(mensaje);
      setProcesando(false);
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

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h2 className="text-light mb-4">Inscripción a Grupos de Asesoría</h2>

      {mi_grupo && (
        <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }} className="mb-4 border-success">
          <Card.Header className="bg-success text-white">
            <h5 className="mb-0">
              <FaUsers className="me-2" />
              Mi Grupo Actual
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={8}>
                <h4 className="text-light">{mi_grupo.nombre}</h4>
                {mi_grupo.descripcion && (
                  <p className="text-muted">{mi_grupo.descripcion}</p>
                )}
                <div className="mt-3">
                  <p className="mb-2">
                    <FaChalkboardTeacher className="me-2 text-info" />
                    <strong>Asesor:</strong>{' '}
                    {mi_grupo.asesor?.nombre} {mi_grupo.asesor?.apellido}
                  </p>
                  <p className="mb-2">
                    <FaCalendar className="me-2 text-warning" />
                    <strong>Período:</strong> {mi_grupo.periodo?.nombre}
                  </p>
                  <p className="mb-0">
                    <FaUsers className="me-2 text-success" />
                    <strong>Estudiantes:</strong>{' '}
                    <Badge bg="info">{(mi_grupo as any).numero_estudiantes || mi_grupo.estudiantes?.length || 0}</Badge>
                  </p>
                </div>
              </Col>
              <Col md={4} className="d-flex align-items-center justify-content-end">
                <Button
                  variant="outline-danger"
                  size="lg"
                  onClick={manejarDesinscripcion}
                  disabled={procesando}
                >
                  <FaUserMinus className="me-2" />
                  {procesando ? 'Procesando...' : 'Desinscribirme'}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {!mi_grupo && (
        <>
          <Alert variant="info">
            <strong>ℹ️ Información:</strong> Selecciona un grupo de asesoría para recibir orientación personalizada durante tu proyecto de tesis.
          </Alert>

          <Row className="g-4">
            {grupos.map((grupo) => (
              <Col key={grupo.id} md={6} lg={4}>
                <Card 
                  style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}
                  className="h-100"
                >
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-3">
                      <h5 className="text-light">{grupo.nombre}</h5>
                      {grupo.descripcion && (
                        <p className="text-muted small">{grupo.descripcion}</p>
                      )}
                    </div>

                    <ListGroup variant="flush" className="mb-3 flex-grow-1">
                      <ListGroup.Item style={{ backgroundColor: 'var(--color-fondo-secundario)', border: 'none' }}>
                        <FaChalkboardTeacher className="me-2 text-info" />
                        <small>
                          <strong>Asesor:</strong><br />
                          {grupo.asesor?.nombre} {grupo.asesor?.apellido}
                        </small>
                      </ListGroup.Item>
                      <ListGroup.Item style={{ backgroundColor: 'var(--color-fondo-secundario)', border: 'none' }}>
                        <FaCalendar className="me-2 text-warning" />
                        <small>
                          <strong>Período:</strong> {grupo.periodo?.nombre}
                        </small>
                      </ListGroup.Item>
                      <ListGroup.Item style={{ backgroundColor: 'var(--color-fondo-secundario)', border: 'none' }}>
                        <FaUsers className="me-2 text-success" />
                        <small>
                          <strong>Estudiantes inscritos:</strong>{' '}
                          <Badge bg="info">{(grupo as any).numero_estudiantes || 0}</Badge>
                        </small>
                      </ListGroup.Item>
                    </ListGroup>

                    <Button
                      variant="primary"
                      className="w-100"
                      onClick={() => manejarInscripcion(grupo.id)}
                      disabled={procesando}
                    >
                      <FaUserPlus className="me-2" />
                      {procesando ? 'Procesando...' : 'Inscribirme'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {grupos.length === 0 && (
            <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
              <Card.Body className="text-center py-5">
                <p className="text-muted">
                  No hay grupos disponibles para inscripción en este momento.
                </p>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default InscripcionGrupos;