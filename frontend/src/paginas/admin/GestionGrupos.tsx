import { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Alert, Row, Col, ListGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { 
  obtenerGrupos, 
  crearGrupo, 
  actualizarGrupo, 
  eliminarGrupo,
  asignarEstudiante,
  removerEstudiante 
} from '../../servicios/grupos.servicio';
import { obtenerPeriodos } from '../../servicios/periodos.servicio';
import { obtenerAsesores } from '../../servicios/asesores.servicio';
import { obtenerEstudiantesSinGrupo } from '../../servicios/administracion.servicio';
import { type Grupo, type Periodo, type Usuario } from '../../tipos/usuario';
import { toast } from 'react-toastify';

const GestionGrupos = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [asesores, setAsesores] = useState<Usuario[]>([]);
  const [estudiantesSinGrupo, setEstudiantesSinGrupo] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEstudiantes, setMostrarModalEstudiantes] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState<Grupo | null>(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<Grupo | null>(null);
  const [formGrupo, setFormGrupo] = useState({
    nombre: '',
    descripcion: '',
    id_asesor: 0,
    id_periodo: 0,
    activo: true,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [gruposData, periodosData, asesoresData, estudiantesData] = await Promise.all([
        obtenerGrupos(),
        obtenerPeriodos(),
        obtenerAsesores(),
        obtenerEstudiantesSinGrupo(),
      ]);
      setGrupos(gruposData);
      setPeriodos(periodosData);
      setAsesores(asesoresData);
      setEstudiantesSinGrupo(estudiantesData);
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  const abrirModalCrear = () => {
    setGrupoEditando(null);
    const periodoActivo = periodos.find(p => p.activo);
    setFormGrupo({
      nombre: '',
      descripcion: '',
      id_asesor: 0,
      id_periodo: periodoActivo?.id || 0,
      activo: true,
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (grupo: Grupo) => {
    setGrupoEditando(grupo);
    setFormGrupo({
      nombre: grupo.nombre,
      descripcion: grupo.descripcion || '',
      id_asesor: grupo.asesor?.id || 0,
      id_periodo: grupo.periodo?.id || 0,
      activo: grupo.activo,
    });
    setMostrarModal(true);
  };

  const abrirModalEstudiantes = (grupo: Grupo) => {
    setGrupoSeleccionado(grupo);
    setMostrarModalEstudiantes(true);
  };

  const manejarGuardar = async () => {
    try {
      if (grupoEditando) {
        await actualizarGrupo(grupoEditando.id, formGrupo);
        toast.success('Grupo actualizado exitosamente');
      } else {
        await crearGrupo(formGrupo);
        toast.success('Grupo creado exitosamente');
      }
      setMostrarModal(false);
      await cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar grupo');
    }
  };

  const manejarEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este grupo?')) return;

    try {
      await eliminarGrupo(id);
      toast.success('Grupo eliminado exitosamente');
      await cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar grupo');
    }
  };

  const manejarAsignarEstudiante = async (estudianteId: number) => {
    if (!grupoSeleccionado) return;

    try {
      await asignarEstudiante(grupoSeleccionado.id, estudianteId);
      toast.success('Estudiante asignado exitosamente');
      await cargarDatos();
      setMostrarModalEstudiantes(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al asignar estudiante');
    }
  };

  const manejarRemoverEstudiante = async (estudianteId: number) => {
    if (!grupoSeleccionado) return;
    if (!window.confirm('¿Está seguro de remover este estudiante del grupo?')) return;

    try {
      await removerEstudiante(grupoSeleccionado.id, estudianteId);
      toast.success('Estudiante removido exitosamente');
      await cargarDatos();
      const grupoActualizado = await obtenerGrupos();
      const grupoNuevo = grupoActualizado.find(g => g.id === grupoSeleccionado.id);
      if (grupoNuevo) setGrupoSeleccionado(grupoNuevo);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al remover estudiante');
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
        <h2 className="text-light mb-0">Gestión de Grupos</h2>
        <Button variant="primary" onClick={abrirModalCrear}>
          <FaPlus className="me-2" />
          Nuevo Grupo
        </Button>
      </div>
      
      <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
        <Card.Body>
          <Table responsive hover variant="dark">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Asesor</th>
                <th>Período</th>
                <th>Estudiantes</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {grupos.map((grupo) => (
                <tr key={grupo.id}>
                  <td><strong>{grupo.nombre}</strong></td>
                  <td>{grupo.descripcion || '-'}</td>
                  <td>
                    {grupo.asesor?.nombre} {grupo.asesor?.apellido}
                  </td>
                  <td>
                    <Badge bg={grupo.periodo?.activo ? 'success' : 'secondary'}>
                      {grupo.periodo?.nombre}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg="info">{grupo.estudiantes?.length || 0}</Badge>
                  </td>
                  <td>
                    {grupo.activo ? (
                      <Badge bg="success">Activo</Badge>
                    ) : (
                      <Badge bg="secondary">Inactivo</Badge>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => abrirModalEstudiantes(grupo)}
                      >
                        <FaUserPlus /> Estudiantes
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => abrirModalEditar(grupo)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => manejarEliminar(grupo.id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {grupos.length === 0 && (
            <p className="text-muted text-center py-5">
              No hay grupos registrados.
            </p>
          )}
        </Card.Body>
      </Card>

      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="lg">
        <Modal.Header closeButton style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Modal.Title>{grupoEditando ? 'Editar' : 'Crear'} Grupo</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Nombre del Grupo</Form.Label>
                  <Form.Control
                    type="text"
                    value={formGrupo.nombre}
                    onChange={(e) => setFormGrupo({ ...formGrupo, nombre: e.target.value })}
                    placeholder="Ej: Grupo A - Ing. Software"
                    style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Estado</Form.Label>
                  <Form.Check
                    type="switch"
                    label="Grupo Activo"
                    checked={formGrupo.activo}
                    onChange={(e) => setFormGrupo({ ...formGrupo, activo: e.target.checked })}
                    className="text-light"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="text-light">Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formGrupo.descripcion}
                onChange={(e) => setFormGrupo({ ...formGrupo, descripcion: e.target.value })}
                placeholder="Descripción del grupo"
                style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Asesor Asignado</Form.Label>
                  <Form.Select
                    value={formGrupo.id_asesor}
                    onChange={(e) => setFormGrupo({ ...formGrupo, id_asesor: parseInt(e.target.value) })}
                    style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                  >
                    <option value={0}>Seleccione un asesor...</option>
                    {asesores.map(asesor => (
                      <option key={asesor.id} value={asesor.perfil?.id_asesor}>
                        {asesor.perfil?.nombre} {asesor.perfil?.apellido}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Período</Form.Label>
                  <Form.Select
                    value={formGrupo.id_periodo}
                    onChange={(e) => setFormGrupo({ ...formGrupo, id_periodo: parseInt(e.target.value) })}
                    style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                  >
                    <option value={0}>Seleccione un período...</option>
                    {periodos.map(periodo => (
                      <option key={periodo.id} value={periodo.id}>
                        {periodo.nombre} {periodo.activo && '(Activo)'}
                      </option>
                    ))}
                  </Form.Select>
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
            {grupoEditando ? 'Actualizar' : 'Crear'} Grupo
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={mostrarModalEstudiantes} onHide={() => setMostrarModalEstudiantes(false)} size="lg">
        <Modal.Header closeButton style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Modal.Title>Gestionar Estudiantes - {grupoSeleccionado?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Row>
            <Col md={6}>
              <h6 className="text-light mb-3">Estudiantes en el Grupo</h6>
              <ListGroup>
                {grupoSeleccionado?.estudiantes && grupoSeleccionado.estudiantes.length > 0 ? (
                  grupoSeleccionado.estudiantes.map((estudiante: any) => (
                    <ListGroup.Item
                      key={estudiante.id}
                      className="d-flex justify-content-between align-items-center"
                      style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                    >
                      <span>{estudiante.nombre} {estudiante.apellido}</span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => manejarRemoverEstudiante(estudiante.id)}
                      >
                        <FaUserMinus />
                      </Button>
                    </ListGroup.Item>
                  ))
                ) : (
                  <p className="text-muted">No hay estudiantes en este grupo</p>
                )}
              </ListGroup>
            </Col>
            <Col md={6}>
              <h6 className="text-light mb-3">Estudiantes Disponibles</h6>
              <ListGroup>
                {estudiantesSinGrupo.length > 0 ? (
                  estudiantesSinGrupo.map((estudiante: any) => (
                    <ListGroup.Item
                      key={estudiante.id}
                      className="d-flex justify-content-between align-items-center"
                      style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                    >
                      <span>{estudiante.nombre} {estudiante.apellido}</span>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => manejarAsignarEstudiante(estudiante.id)}
                      >
                        <FaUserPlus />
                      </Button>
                    </ListGroup.Item>
                  ))
                ) : (
                  <p className="text-muted">No hay estudiantes sin grupo</p>
                )}
              </ListGroup>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Button variant="secondary" onClick={() => setMostrarModalEstudiantes(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GestionGrupos;