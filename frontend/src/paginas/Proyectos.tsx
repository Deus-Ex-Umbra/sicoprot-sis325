import { useState, useEffect, type ChangeEvent } from 'react';
import { Card, Button, Table, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEye, FaFileUpload } from 'react-icons/fa';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { obtenerProyectos, crearProyecto } from '../servicios/proyectos.servicio';
import { obtenerAsesores } from '../servicios/asesores.servicio';
import { type Proyecto, type Usuario, Rol } from '../tipos/usuario';
import TomSelect from 'tom-select';

const Proyectos = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [asesores, setAsesores] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoProyecto, setNuevoProyecto] = useState({
    titulo: '',
    id_asesor: 0,
  });
  
  const { usuario } = useAutenticacion();
  const navigate = useNavigate();
  const esEstudiante = usuario?.rol === Rol.Estudiante;

  useEffect(() => {
    cargarProyectos();
    if (esEstudiante) {
      cargarAsesores();
    }
  }, [esEstudiante]);

  const cargarProyectos = async () => {
    try {
      setCargando(true);
      const data = await obtenerProyectos();
      setProyectos(data);
    } catch (err: any) {
      setError('Error al cargar los proyectos');
    } finally {
      setCargando(false);
    }
  };

  const cargarAsesores = async () => {
    try {
      const data = await obtenerAsesores();
      setAsesores(data);
    } catch (err) {
      setError('Error al cargar los asesores');
    }
  };

  const manejarCrearProyecto = async () => {
    if (!nuevoProyecto.titulo || !nuevoProyecto.id_asesor) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      await crearProyecto(nuevoProyecto);
      setMostrarModal(false);
      await cargarProyectos();
      setNuevoProyecto({ titulo: '', id_asesor: 0 });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el proyecto');
    }
  };

  useEffect(() => {
    if (mostrarModal && asesores.length > 0) {
      const select = new TomSelect('#select-asesor', {
        create: false,
        sortField: [
          {
            field: 'text',
            direction: 'asc',
          },
        ],
      });
      return () => {
        select.destroy();
      };
    }
  }, [mostrarModal, asesores]);

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-light">
          {esEstudiante ? 'Mis Proyectos' : 'Proyectos Asignados'}
        </h2>
        {esEstudiante && (
          <Button variant="primary" onClick={() => setMostrarModal(true)}>
            <FaPlus className="me-2" />
            Nuevo Proyecto
          </Button>
        )}
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {proyectos.length === 0 ? (
        <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Card.Body className="text-center py-5">
            <p className="text-muted mb-3">
              {esEstudiante ? 'No tienes proyectos registrados' : 'No tienes proyectos asignados'}
            </p>
            {esEstudiante && (
              <Button variant="primary" onClick={() => setMostrarModal(true)}>
                <FaPlus className="me-2" />
                Crear mi primer proyecto
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Card.Body>
            <Table responsive hover variant="dark">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Estudiante</th>
                  <th>Asesor</th>
                  <th>Documentos</th>
                  <th>Fecha de Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((proyecto) => (
                  <tr key={proyecto.id}>
                    <td>{proyecto.titulo}</td>
                    <td>
                      {proyecto.estudiante?.nombre} {proyecto.estudiante?.apellido}
                    </td>
                    <td>
                      {proyecto.asesor?.nombre} {proyecto.asesor?.apellido}
                    </td>
                    <td>
                      <Badge bg="info">{proyecto.documentos?.length || 0}</Badge>
                    </td>
                    <td>{new Date(proyecto.fecha_creacion).toLocaleDateString()}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => navigate(`/panel/proyecto/${proyecto.id}`)}
                      >
                        <FaEye className="me-1" />
                        Ver
                      </Button>
                      {esEstudiante && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => navigate(`/panel/proyecto/${proyecto.id}`)}
                        >
                          <FaFileUpload className="me-1" />
                          Subir Doc
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Modal.Title>Crear Nuevo Proyecto</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Título del Proyecto</Form.Label>
              <Form.Control
                type="text"
                value={nuevoProyecto.titulo}
                onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, titulo: e.target.value })}
                placeholder="Ingrese el título del proyecto"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Asesor</Form.Label>
              <select 
                id="select-asesor"
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setNuevoProyecto({ ...nuevoProyecto, id_asesor: parseInt(e.target.value)})}
              >
                <option value="">Selecciona un asesor...</option>
                {asesores.map(asesor => (
                  <option key={asesor.id} value={asesor.perfil?.id_asesor}>
                    {asesor.perfil?.nombre} {asesor.perfil?.apellido}
                  </option>
                ))}
              </select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={manejarCrearProyecto}>
            Crear Proyecto
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Proyectos;