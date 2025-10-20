import { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Alert, ListGroup, Table } from 'react-bootstrap';
import { FaUserPlus, FaUserMinus, FaUsers, FaChalkboardTeacher, FaCalendar, FaUserGraduate } from 'react-icons/fa';
import { obtenerGruposDisponibles, obtenerMiGrupo, inscribirseAGrupo, desinscribirseDeGrupo } from '../servicios/grupos.servicio';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { type Grupo } from '../tipos/usuario';
import { toast } from 'react-toastify';

const InscripcionGrupos = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [miGrupo, setMiGrupo] = useState<Grupo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const { usuario } = useAutenticacion();

  const mi_id_estudiante = usuario?.perfil?.id_estudiante;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [grupoActual, gruposDisponibles] = await Promise.all([
        obtenerMiGrupo(),
        obtenerGruposDisponibles()
      ]);
      
      setMiGrupo(grupoActual);
      setGrupos(gruposDisponibles);
    } catch (err) {
      console.error('Error al cargar datos:', err);
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
      
      await cargarDatos();
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al inscribirse al grupo';
      toast.error(mensaje);
    } finally {
      setProcesando(false);
    }
  };

  const manejarDesinscripcion = async () => {
    if (!miGrupo || procesando) return;
    
    if (!window.confirm('¿Estás seguro de que deseas desinscribirte de este grupo?')) {
      return;
    }

    setProcesando(true);

    try {
      await desinscribirseDeGrupo(miGrupo.id);
      toast.success('Te has desinscrito exitosamente del grupo.');
      
      await cargarDatos();
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al desinscribirse del grupo';
      toast.error(mensaje);
    } finally {
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
      <h2 className="text-light mb-4">
        <FaUsers className="me-2" />
        {miGrupo ? 'Mi Grupo de Asesoría' : 'Inscripción a Grupos de Asesoría'}
      </h2>

      {miGrupo ? (
        <Row>
          <Col lg={12}>
            <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }} className="mb-4 border-success border-3">
              <Card.Header className="bg-success text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">
                    <FaUsers className="me-2" />
                    {miGrupo.nombre}
                  </h4>
                  <Badge bg="light" text="dark" className="fs-6">
                    <FaUserGraduate className="me-1" />
                    {miGrupo.estudiantes?.length || 0} estudiantes
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <Row className="mb-4">
                  <Col md={6}>
                    {miGrupo.descripcion && (
                      <div className="mb-3">
                        <h6 className="text-light">Descripción:</h6>
                        <p className="text-muted">{miGrupo.descripcion}</p>
                      </div>
                    )}
                    <div className="mb-2">
                      <FaChalkboardTeacher className="me-2 text-info" />
                      <strong className="text-light">Asesor:</strong>{' '}
                      <span className="text-muted">
                        {miGrupo.asesor?.nombre} {miGrupo.asesor?.apellido}
                      </span>
                    </div>
                    <div className="mb-2">
                      <FaCalendar className="me-2 text-warning" />
                      <strong className="text-light">Período:</strong>{' '}
                      <span className="text-muted">{miGrupo.periodo?.nombre}</span>
                    </div>
                    {miGrupo.periodo && (
                      <div className="mt-3">
                        <small className="text-muted">
                          <strong>Inscripciones:</strong>{' '}
                          {new Date(miGrupo.periodo.fecha_inicio_inscripciones).toLocaleDateString()} -{' '}
                          {new Date(miGrupo.periodo.fecha_fin_inscripciones).toLocaleDateString()}
                        </small>
                      </div>
                    )}
                  </Col>
                  <Col md={6} className="d-flex align-items-center justify-content-end">
                    <Button
                      variant="outline-danger"
                      size="lg"
                      onClick={manejarDesinscripcion}
                      disabled={procesando}
                    >
                      <FaUserMinus className="me-2" />
                      {procesando ? 'Procesando...' : 'Desinscribirme del Grupo'}
                    </Button>
                  </Col>
                </Row>

                <hr className="border-secondary" />

                <h5 className="text-light mb-3 mt-4">
                  <FaUserGraduate className="me-2" />
                  Estudiantes Inscritos ({miGrupo.estudiantes?.length || 0})
                </h5>

                {miGrupo.estudiantes && miGrupo.estudiantes.length > 0 ? (
                  <Table responsive hover variant="dark">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre Completo</th>
                        <th>Correo</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {miGrupo.estudiantes.map((estudiante: any, index: number) => {
                        const es_yo = estudiante.id === mi_id_estudiante;
                        return (
                          <tr key={estudiante.id} className={es_yo ? 'table-primary' : ''}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>
                                {estudiante.nombre} {estudiante.apellido}
                                {es_yo && (
                                  <Badge bg="primary" className="ms-2">Tú</Badge>
                                )}
                              </strong>
                            </td>
                            <td>{estudiante.usuario?.correo || 'N/A'}</td>
                            <td>
                              <Badge bg="success">Inscrito</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="info">
                    Aún no hay estudiantes inscritos en este grupo.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <>
          <Alert variant="info" className="mb-4">
            <strong>ℹ️ Información:</strong> Selecciona un grupo de asesoría para recibir orientación personalizada durante tu proyecto de tesis. 
            Una vez inscrito, podrás ver a tus compañeros de grupo.
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
                <FaUsers size={60} className="text-muted mb-3" />
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