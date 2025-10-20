import { useState, useEffect } from 'react';
import { Card, Table, Badge, Alert, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  obtenerObservacionesPorEstudiante, 
  actualizarObservacion, 
  eliminarObservacion 
} from '../servicios/observaciones.servicio';
import { 
  obtenerCorreccionesPorEstudiante,
  actualizarCorreccion,
  eliminarCorreccion
} from '../servicios/correcciones.servicio';
import { EstadoObservacion, estadoConfig } from '../tipos/estadoObservacion';
import { Clock, Eye, CheckCircle, XCircle, Edit2, Trash2, Plus } from 'lucide-react';
import { type Observacion, type Correccion } from '../tipos/usuario';
import { toast } from 'react-toastify';
import ChecklistObservaciones from '../componentes/ChecklistObservaciones';

const iconos = {
  'clock': Clock,
  'eye': Eye,
  'check-circle': CheckCircle,
  'x-circle': XCircle
};

const Observaciones = () => {
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [correcciones, setCorrecciones] = useState<Correccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [mostrarModalEditarCorreccion, setMostrarModalEditarCorreccion] = useState(false);
  const [correccionEditando, setCorreccionEditando] = useState<Correccion | null>(null);
  const [formCorreccion, setFormCorreccion] = useState({
    descripcion: '',
    x_inicio: 0,
    y_inicio: 0,
    x_fin: 0,
    y_fin: 0,
    pagina_inicio: 1,
    pagina_fin: 1,
    color: '#28a745'
  });

  const observacionesPendientes = observaciones.filter(obs => 
    obs.estado === 'pendiente' && !obs.correccion
  );

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [obsData, corrData] = await Promise.all([
        obtenerObservacionesPorEstudiante(),
        obtenerCorreccionesPorEstudiante()
      ]);
      setObservaciones(obsData);
      setCorrecciones(corrData);
    } catch (err) {
      setError('No se pudo cargar la lista de observaciones y correcciones.');
    } finally {
      setCargando(false);
    }
  };

  const abrirModalEditarCorreccion = (correccion: Correccion) => {
    setCorreccionEditando(correccion);
    setFormCorreccion({
      descripcion: correccion.descripcion,
      x_inicio: correccion.x_inicio,
      y_inicio: correccion.y_inicio,
      x_fin: correccion.x_fin,
      y_fin: correccion.y_fin,
      pagina_inicio: correccion.pagina_inicio,
      pagina_fin: correccion.pagina_fin,
      color: correccion.color
    });
    setMostrarModalEditarCorreccion(true);
  };

  const manejarActualizarCorreccion = async () => {
    if (!correccionEditando) return;

    try {
      await actualizarCorreccion(correccionEditando.id, formCorreccion);
      toast.success('Corrección actualizada exitosamente');
      setMostrarModalEditarCorreccion(false);
      await cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar la corrección');
    }
  };

  const manejarEliminarCorreccion = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta corrección?')) return;

    try {
      await eliminarCorreccion(id);
      toast.success('Corrección eliminada exitosamente');
      await cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar la corrección');
    }
  };

  const irACrearCorreccion = (proyectoId: number) => {
    navigate(`/panel/proyecto/${proyectoId}/crear-correccion`);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-light mb-0">Mis Observaciones y Correcciones</h2>
        {observacionesPendientes.length > 0 && (
          <Badge bg="warning" text="dark" className="fs-6">
            {observacionesPendientes.length} pendiente(s) de corregir
          </Badge>
        )}
      </div>

      <Row className="mb-4">
        <Col lg={12}>
          <ChecklistObservaciones observaciones={observaciones} />
        </Col>
      </Row>
      
      <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }} className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Observaciones Recibidas</h5>
        </Card.Header>
        <Card.Body>
          {observaciones.length > 0 ? (
            <Table responsive hover variant="dark">
              <thead>
                <tr>
                  <th>Observación</th>
                  <th>Proyecto</th>
                  <th>Documento</th>
                  <th>Página</th>
                  <th>Estado</th>
                  <th>Corrección</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {observaciones.map((obs) => {
                  const estadoInfo = estadoConfig[obs.estado as keyof typeof estadoConfig];
                  const IconoEstado = iconos[estadoInfo?.icon as keyof typeof iconos] || Clock;
                  
                  return (
                    <tr key={obs.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div 
                            style={{ 
                              width: '20px', 
                              height: '20px', 
                              backgroundColor: obs.color,
                              borderRadius: '4px',
                              border: '1px solid #555'
                            }}
                          />
                          <div>
                            <strong>{obs.titulo}</strong>
                            <br />
                            <small className="text-muted">
                              {obs.contenido.length > 60 
                                ? `${obs.contenido.substring(0, 60)}...` 
                                : obs.contenido
                              }
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{(obs as any).documento?.proyecto?.titulo || 'N/A'}</td>
                      <td>
                        <Badge bg="secondary">
                          v{(obs as any).documento?.version}
                        </Badge>
                      </td>
                      <td>{obs.pagina_inicio}</td>
                      <td>
                        <Badge className={estadoInfo?.className}>
                          <IconoEstado size={14} className="me-1" />
                          {estadoInfo?.label}
                        </Badge>
                      </td>
                      <td>
                        {obs.correccion ? (
                          <Badge bg="success">Sí</Badge>
                        ) : (
                          <Badge bg="warning" text="dark">Pendiente</Badge>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {!obs.correccion && obs.estado === 'pendiente' && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => irACrearCorreccion((obs as any).documento?.proyecto?.id)}
                              title="Crear corrección"
                            >
                              <Plus size={14} />
                            </Button>
                          )}
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/panel/proyecto/${(obs as any).documento?.proyecto?.id}`)}
                          >
                            <Eye size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted text-center py-5">
              No tienes observaciones pendientes.
            </p>
          )}
        </Card.Body>
      </Card>

      <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
        <Card.Header>
          <h5 className="mb-0">Mis Correcciones</h5>
        </Card.Header>
        <Card.Body>
          {correcciones.length > 0 ? (
            <Table responsive hover variant="dark">
              <thead>
                <tr>
                  <th>Corrección</th>
                  <th>Observación Asociada</th>
                  <th>Documento</th>
                  <th>Página</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {correcciones.map((corr) => (
                  <tr key={corr.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div 
                          style={{ 
                            width: '20px', 
                            height: '20px', 
                            backgroundColor: corr.color,
                            borderRadius: '4px',
                            border: '1px solid #555'
                          }}
                        />
                        <div>
                          <strong>{corr.titulo}</strong>
                          <br />
                          <small className="text-muted">
                            {corr.descripcion.length > 60 
                              ? `${corr.descripcion.substring(0, 60)}...` 
                              : corr.descripcion
                            }
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>{corr.observacion?.titulo || 'N/A'}</td>
                    <td>
                      <Badge bg="secondary">
                        v{(corr as any).documento?.version}
                      </Badge>
                    </td>
                    <td>{corr.pagina_inicio}</td>
                    <td>
                      <small className="text-muted">
                        {new Date(corr.fecha_creacion).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => abrirModalEditarCorreccion(corr)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => manejarEliminarCorreccion(corr.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/panel/proyecto/${(corr as any).documento?.proyecto?.id}`)}
                        >
                          <Eye size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted text-center py-5">
              No has realizado correcciones aún.
            </p>
          )}
        </Card.Body>
      </Card>

      <Modal 
        show={mostrarModalEditarCorreccion} 
        onHide={() => setMostrarModalEditarCorreccion(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Editar Corrección</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formCorreccion.descripcion}
                onChange={(e) => setFormCorreccion({ ...formCorreccion, descripcion: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Color</Form.Label>
                  <Form.Control
                    type="color"
                    value={formCorreccion.color}
                    onChange={(e) => setFormCorreccion({ ...formCorreccion, color: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="mb-3">Coordenadas</h6>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>X Inicio (%)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={formCorreccion.x_inicio}
                    onChange={(e) => setFormCorreccion({ ...formCorreccion, x_inicio: parseFloat(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Y Inicio (%)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={formCorreccion.y_inicio}
                    onChange={(e) => setFormCorreccion({ ...formCorreccion, y_inicio: parseFloat(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>X Fin (%)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={formCorreccion.x_fin}
                    onChange={(e) => setFormCorreccion({ ...formCorreccion, x_fin: parseFloat(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Y Fin (%)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={formCorreccion.y_fin}
                    onChange={(e) => setFormCorreccion({ ...formCorreccion, y_fin: parseFloat(e.target.value) })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Página Inicio</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formCorreccion.pagina_inicio}
                    onChange={(e) => setFormCorreccion({ ...formCorreccion, pagina_inicio: parseInt(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Página Fin</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formCorreccion.pagina_fin}
                    onChange={(e) => setFormCorreccion({ ...formCorreccion, pagina_fin: parseInt(e.target.value) })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModalEditarCorreccion(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={manejarActualizarCorreccion}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Observaciones;