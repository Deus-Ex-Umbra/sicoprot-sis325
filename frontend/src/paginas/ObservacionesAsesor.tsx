import { useState, useEffect } from 'react';
import { Card, Table, Badge, Alert, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { obtenerProyectos } from '../servicios/proyectos.servicio';
import { 
  obtenerObservacionesPorProyecto,
  actualizarObservacion,
  eliminarObservacion
} from '../servicios/observaciones.servicio';
import { obtenerCorreccionesPorProyecto } from '../servicios/correcciones.servicio';
import { EstadoObservacion, estadoConfig } from '../tipos/estadoObservacion';
import { Clock, Eye, CheckCircle, XCircle, Edit2, Trash2, Plus } from 'lucide-react';
import { type Observacion, type Proyecto, type Correccion } from '../tipos/usuario';
import { toast } from 'react-toastify';
import CambiarEstadoObservacion from '../componentes/CambiarEstadoObservacion';

const iconos = {
  'clock': Clock,
  'eye': Eye,
  'check-circle': CheckCircle,
  'x-circle': XCircle
};

const ObservacionesAsesor = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [correcciones, setCorrecciones] = useState<Correccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [mostrarModalEditarObservacion, setMostrarModalEditarObservacion] = useState(false);
  const [observacionEditando, setObservacionEditando] = useState<Observacion | null>(null);
  const [formObservacion, setFormObservacion] = useState({
    titulo: '',
    contenido: '',
    x_inicio: 0,
    y_inicio: 0,
    x_fin: 0,
    y_fin: 0,
    pagina_inicio: 1,
    pagina_fin: 1,
    color: '#FFD700'
  });

  useEffect(() => {
    cargarProyectos();
  }, []);

  useEffect(() => {
    if (proyectoSeleccionado) {
      cargarDatos(proyectoSeleccionado);
    }
  }, [proyectoSeleccionado]);

  const cargarProyectos = async () => {
    try {
      const data = await obtenerProyectos();
      setProyectos(data);
      if (data.length > 0) {
        setProyectoSeleccionado(data[0].id);
      }
    } catch (err) {
      setError('No se pudo cargar la lista de proyectos.');
    } finally {
      setCargando(false);
    }
  };

  const cargarDatos = async (proyectoId: number) => {
    try {
      const [obsData, corrData] = await Promise.all([
        obtenerObservacionesPorProyecto(proyectoId),
        obtenerCorreccionesPorProyecto(proyectoId)
      ]);
      setObservaciones(obsData);
      setCorrecciones(corrData);
    } catch (err) {
      setError('No se pudo cargar las observaciones del proyecto.');
    }
  };

  const abrirModalEditarObservacion = (obs: Observacion) => {
    setObservacionEditando(obs);
    setFormObservacion({
      titulo: obs.titulo,
      contenido: obs.contenido,
      x_inicio: obs.x_inicio,
      y_inicio: obs.y_inicio,
      x_fin: obs.x_fin,
      y_fin: obs.y_fin,
      pagina_inicio: obs.pagina_inicio,
      pagina_fin: obs.pagina_fin,
      color: obs.color
    });
    setMostrarModalEditarObservacion(true);
  };

  const manejarActualizarObservacion = async () => {
    if (!observacionEditando) return;

    try {
      await actualizarObservacion(observacionEditando.id, formObservacion);
      toast.success('Observación actualizada exitosamente');
      setMostrarModalEditarObservacion(false);
      if (proyectoSeleccionado) {
        await cargarDatos(proyectoSeleccionado);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar la observación');
    }
  };

  const manejarEliminarObservacion = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta observación?')) return;

    try {
      await eliminarObservacion(id);
      toast.success('Observación eliminada exitosamente');
      if (proyectoSeleccionado) {
        await cargarDatos(proyectoSeleccionado);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar la observación');
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

  const proyectoActual = proyectos.find(p => p.id === proyectoSeleccionado);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-light mb-0">Gestión de Observaciones</h2>
        {proyectoActual && (
          <Button
            variant="warning"
            onClick={() => navigate(`/panel/proyecto/${proyectoActual.id}/crear-observacion`)}
          >
            <Plus size={18} className="me-2" />
            Nueva Observación
          </Button>
        )}
      </div>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label className="text-light">Seleccionar Proyecto</Form.Label>
            <Form.Select
              value={proyectoSeleccionado || ''}
              onChange={(e) => setProyectoSeleccionado(Number(e.target.value))}
              style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
            >
              {proyectos.map(proyecto => (
                <option key={proyecto.id} value={proyecto.id}>
                  {proyecto.titulo} - {proyecto.estudiante?.nombre} {proyecto.estudiante?.apellido}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        {proyectoActual && (
          <Col md={6} className="d-flex align-items-end">
            <Button
              variant="primary"
              onClick={() => navigate(`/panel/proyecto/${proyectoActual.id}`)}
            >
              Ir al Proyecto Completo
            </Button>
          </Col>
        )}
      </Row>
      
      <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }} className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Observaciones Realizadas</h5>
        </Card.Header>
        <Card.Body>
          {observaciones.length > 0 ? (
            <Table responsive hover variant="dark">
              <thead>
                <tr>
                  <th>Observación</th>
                  <th>Documento</th>
                  <th>Página</th>
                  <th>Estado</th>
                  <th>Corrección</th>
                  <th>Fecha</th>
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
                          <Badge bg="warning" text="dark">No</Badge>
                        )}
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(obs.fecha_creacion).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => abrirModalEditarObservacion(obs)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => manejarEliminarObservacion(obs.id)}
                            disabled={!!obs.correccion}
                          >
                            <Trash2 size={14} />
                          </Button>
                          <CambiarEstadoObservacion
                            observacion={obs}
                            onEstadoCambiado={(obsActualizada) => {
                              setObservaciones(prev => 
                                prev.map(o => o.id === obsActualizada.id ? obsActualizada : o)
                              );
                            }}
                          />
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/panel/proyecto/${proyectoSeleccionado}`)}
                          >
                            <Eye size={14} />
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
              No hay observaciones en este proyecto.
            </p>
          )}
        </Card.Body>
      </Card>

      <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
        <Card.Header>
          <h5 className="mb-0">Correcciones del Estudiante</h5>
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
                  <th>Estudiante</th>
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
                      {corr.estudiante?.nombre} {corr.estudiante?.apellido}
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(corr.fecha_creacion).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/panel/proyecto/${proyectoSeleccionado}`)}
                      >
                        <Eye size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted text-center py-5">
              No hay correcciones en este proyecto.
            </p>
          )}
        </Card.Body>
      </Card>

      <Modal 
        show={mostrarModalEditarObservacion} 
        onHide={() => setMostrarModalEditarObservacion(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Editar Observación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                value={formObservacion.titulo}
                onChange={(e) => setFormObservacion({ ...formObservacion, titulo: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contenido</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formObservacion.contenido}
                onChange={(e) => setFormObservacion({ ...formObservacion, contenido: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Color</Form.Label>
                  <Form.Control
                    type="color"
                    value={formObservacion.color}
                    onChange={(e) => setFormObservacion({ ...formObservacion, color: e.target.value })}
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
                    value={formObservacion.x_inicio}
                    onChange={(e) => setFormObservacion({ ...formObservacion, x_inicio: parseFloat(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Y Inicio (%)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={formObservacion.y_inicio}
                    onChange={(e) => setFormObservacion({ ...formObservacion, y_inicio: parseFloat(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>X Fin (%)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={formObservacion.x_fin}
                    onChange={(e) => setFormObservacion({ ...formObservacion, x_fin: parseFloat(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Y Fin (%)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={formObservacion.y_fin}
                    onChange={(e) => setFormObservacion({ ...formObservacion, y_fin: parseFloat(e.target.value) })}
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
                    value={formObservacion.pagina_inicio}
                    onChange={(e) => setFormObservacion({ ...formObservacion, pagina_inicio: parseInt(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Página Fin</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formObservacion.pagina_fin}
                    onChange={(e) => setFormObservacion({ ...formObservacion, pagina_fin: parseInt(e.target.value) })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModalEditarObservacion(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={manejarActualizarObservacion}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ObservacionesAsesor;