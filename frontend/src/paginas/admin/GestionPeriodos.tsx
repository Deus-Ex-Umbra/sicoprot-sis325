import { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Alert, Row, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { obtenerPeriodos, crearPeriodo, actualizarPeriodo, eliminarPeriodo } from '../../servicios/periodos.servicio';
import { type Periodo } from '../../tipos/usuario';
import { toast } from 'react-toastify';

const GestionPeriodos = () => {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [periodoEditando, setPeriodoEditando] = useState<Periodo | null>(null);
  const [formPeriodo, setFormPeriodo] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio_semestre: '',
    fecha_fin_semestre: '',
    fecha_inicio_inscripciones: '',
    fecha_fin_inscripciones: '',
    activo: false,
  });

  useEffect(() => {
    cargarPeriodos();
  }, []);

  const cargarPeriodos = async () => {
    try {
      const data = await obtenerPeriodos();
      setPeriodos(data);
    } catch (err) {
      setError('Error al cargar los períodos');
    } finally {
      setCargando(false);
    }
  };

  const abrirModalCrear = () => {
    setPeriodoEditando(null);
    setFormPeriodo({
      nombre: '',
      descripcion: '',
      fecha_inicio_semestre: '',
      fecha_fin_semestre: '',
      fecha_inicio_inscripciones: '',
      fecha_fin_inscripciones: '',
      activo: false,
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (periodo: Periodo) => {
    setPeriodoEditando(periodo);
    setFormPeriodo({
      nombre: periodo.nombre,
      descripcion: periodo.descripcion || '',
      fecha_inicio_semestre: periodo.fecha_inicio_semestre.split('T')[0],
      fecha_fin_semestre: periodo.fecha_fin_semestre.split('T')[0],
      fecha_inicio_inscripciones: periodo.fecha_inicio_inscripciones.split('T')[0],
      fecha_fin_inscripciones: periodo.fecha_fin_inscripciones.split('T')[0],
      activo: periodo.activo,
    });
    setMostrarModal(true);
  };

  const manejarGuardar = async () => {
    try {
      if (periodoEditando) {
        await actualizarPeriodo(periodoEditando.id, formPeriodo);
        toast.success('Período actualizado exitosamente');
      } else {
        await crearPeriodo(formPeriodo);
        toast.success('Período creado exitosamente');
      }
      setMostrarModal(false);
      await cargarPeriodos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar período');
    }
  };

  const manejarEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este período?')) return;

    try {
      await eliminarPeriodo(id);
      toast.success('Período eliminado exitosamente');
      await cargarPeriodos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar período');
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-light mb-0">Gestión de Períodos</h2>
        <Button variant="primary" onClick={abrirModalCrear}>
          <FaPlus className="me-2" />
          Nuevo Período
        </Button>
      </div>
      
      <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
        <Card.Body>
          <Table responsive hover variant="dark">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Semestre</th>
                <th>Inscripciones</th>
                <th>Estado</th>
                <th>Grupos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {periodos.map((periodo) => (
                <tr key={periodo.id}>
                  <td>
                    <strong>{periodo.nombre}</strong>
                    {periodo.activo && (
                      <Badge bg="success" className="ms-2">
                        <FaCheckCircle /> Activo
                      </Badge>
                    )}
                  </td>
                  <td>{periodo.descripcion || '-'}</td>
                  <td>
                    <small className="text-muted">
                      {new Date(periodo.fecha_inicio_semestre).toLocaleDateString()} - 
                      {new Date(periodo.fecha_fin_semestre).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <small className="text-muted">
                      {new Date(periodo.fecha_inicio_inscripciones).toLocaleDateString()} - 
                      {new Date(periodo.fecha_fin_inscripciones).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    {periodo.activo ? (
                      <Badge bg="success">Activo</Badge>
                    ) : (
                      <Badge bg="secondary">Inactivo</Badge>
                    )}
                  </td>
                  <td>
                    <Badge bg="info">{periodo.grupos?.length || 0}</Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => abrirModalEditar(periodo)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => manejarEliminar(periodo.id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {periodos.length === 0 && (
            <p className="text-muted text-center py-5">
              No hay períodos registrados.
            </p>
          )}
        </Card.Body>
      </Card>

      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="lg">
        <Modal.Header closeButton style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Modal.Title>{periodoEditando ? 'Editar' : 'Crear'} Período</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    value={formPeriodo.nombre}
                    onChange={(e) => setFormPeriodo({ ...formPeriodo, nombre: e.target.value })}
                    placeholder="Ej: 2025-1"
                    style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Estado</Form.Label>
                  <Form.Check
                    type="switch"
                    label="Período Activo"
                    checked={formPeriodo.activo}
                    onChange={(e) => setFormPeriodo({ ...formPeriodo, activo: e.target.checked })}
                    className="text-light"
                  />
                  <Form.Text className="text-muted">
                    Solo puede haber un período activo a la vez
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="text-light">Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formPeriodo.descripcion}
                onChange={(e) => setFormPeriodo({ ...formPeriodo, descripcion: e.target.value })}
                placeholder="Descripción del período"
                style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
              />
            </Form.Group>

            <h6 className="text-light mb-3">Fechas del Semestre</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Inicio Semestre</Form.Label>
                  <Form.Control
                    type="date"
                    value={formPeriodo.fecha_inicio_semestre}
                    onChange={(e) => setFormPeriodo({ ...formPeriodo, fecha_inicio_semestre: e.target.value })}
                    style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Fin Semestre</Form.Label>
                  <Form.Control
                    type="date"
                    value={formPeriodo.fecha_fin_semestre}
                    onChange={(e) => setFormPeriodo({ ...formPeriodo, fecha_fin_semestre: e.target.value })}
                    style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="text-light mb-3">Fechas de Inscripciones</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Inicio Inscripciones</Form.Label>
                  <Form.Control
                    type="date"
                    value={formPeriodo.fecha_inicio_inscripciones}
                    onChange={(e) => setFormPeriodo({ ...formPeriodo, fecha_inicio_inscripciones: e.target.value })}
                    style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Fin Inscripciones</Form.Label>
                  <Form.Control
                    type="date"
                    value={formPeriodo.fecha_fin_inscripciones}
                    onChange={(e) => setFormPeriodo({ ...formPeriodo, fecha_fin_inscripciones: e.target.value })}
                    style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={manejarGuardar}>
            {periodoEditando ? 'Actualizar' : 'Crear'} Período
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GestionPeriodos;