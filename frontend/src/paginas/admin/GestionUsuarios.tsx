import { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { obtenerTodosUsuarios, cambiarEstadoUsuario } from '../../servicios/administracion.servicio';
import { type Usuario, EstadoUsuario, Rol } from '../../tipos/usuario';
import { toast } from 'react-toastify';

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoUsuario>(EstadoUsuario.Activo);
  
  const [filtros, setFiltros] = useState({
    busqueda: '',
    rol: '',
    estado: '',
    grupo: ''
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, usuarios]);

  const cargarUsuarios = async () => {
    try {
      const data = await obtenerTodosUsuarios();
      setUsuarios(data);
      setUsuariosFiltrados(data);
    } catch (err) {
      setError('Error al cargar los usuarios');
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...usuarios];

    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(usuario => 
        usuario.correo.toLowerCase().includes(busquedaLower) ||
        (usuario.perfil?.nombre?.toLowerCase().includes(busquedaLower)) ||
        (usuario.perfil?.apellido?.toLowerCase().includes(busquedaLower))
      );
    }

    if (filtros.rol) {
      resultado = resultado.filter(usuario => usuario.rol === filtros.rol);
    }

    if (filtros.estado) {
      resultado = resultado.filter(usuario => usuario.estado === filtros.estado);
    }

    if (filtros.grupo === 'con_grupo') {
      resultado = resultado.filter(usuario => 
        usuario.rol === Rol.Estudiante && usuario.perfil?.grupo
      );
    } else if (filtros.grupo === 'sin_grupo') {
      resultado = resultado.filter(usuario => 
        usuario.rol === Rol.Estudiante && !usuario.perfil?.grupo
      );
    }

    setUsuariosFiltrados(resultado);
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      rol: '',
      estado: '',
      grupo: ''
    });
  };

  const abrirModalCambiarEstado = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setNuevoEstado(usuario.estado);
    setMostrarModal(true);
  };

  const manejarCambiarEstado = async () => {
    if (!usuarioSeleccionado) return;

    try {
      await cambiarEstadoUsuario(usuarioSeleccionado.id, nuevoEstado);
      toast.success('Estado actualizado exitosamente');
      setMostrarModal(false);
      await cargarUsuarios();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const obtenerBadgeEstado = (estado: EstadoUsuario) => {
    switch (estado) {
      case EstadoUsuario.Activo:
        return <Badge bg="success">Activo</Badge>;
      case EstadoUsuario.Pendiente:
        return <Badge bg="warning" text="dark">Pendiente</Badge>;
      case EstadoUsuario.Inactivo:
        return <Badge bg="secondary">Inactivo</Badge>;
      case EstadoUsuario.Eliminado:
        return <Badge bg="danger">Eliminado</Badge>;
      default:
        return <Badge bg="secondary">{estado}</Badge>;
    }
  };

  const obtenerBadgeRol = (rol: Rol) => {
    switch (rol) {
      case Rol.Estudiante:
        return <Badge bg="primary">Estudiante</Badge>;
      case Rol.Asesor:
        return <Badge bg="info">Asesor</Badge>;
      case Rol.Administrador:
        return <Badge bg="danger">Administrador</Badge>;
      default:
        return <Badge bg="secondary">{rol}</Badge>;
    }
  };

  const hayFiltrosActivos = filtros.busqueda || filtros.rol || filtros.estado || filtros.grupo;

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
      <h2 className="text-light mb-4">Gestión de Usuarios</h2>
      
      <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }} className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Filtros de Búsqueda</h5>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label className="text-light">Buscar</Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ backgroundColor: 'var(--color-fondo-secundario)', borderColor: 'var(--color-borde)' }}>
                    <FaSearch className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Nombre, apellido o correo..."
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                    style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)', borderColor: 'var(--color-borde)' }}
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label className="text-light">Rol</Form.Label>
                <Form.Select
                  value={filtros.rol}
                  onChange={(e) => setFiltros({ ...filtros, rol: e.target.value })}
                  style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)', borderColor: 'var(--color-borde)' }}
                >
                  <option value="">Todos los roles</option>
                  <option value={Rol.Estudiante}>Estudiante</option>
                  <option value={Rol.Asesor}>Asesor</option>
                  <option value={Rol.Administrador}>Administrador</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label className="text-light">Estado</Form.Label>
                <Form.Select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                  style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)', borderColor: 'var(--color-borde)' }}
                >
                  <option value="">Todos los estados</option>
                  <option value={EstadoUsuario.Activo}>Activo</option>
                  <option value={EstadoUsuario.Pendiente}>Pendiente</option>
                  <option value={EstadoUsuario.Inactivo}>Inactivo</option>
                  <option value={EstadoUsuario.Eliminado}>Eliminado</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label className="text-light">Grupo (Estudiantes)</Form.Label>
                <Form.Select
                  value={filtros.grupo}
                  onChange={(e) => setFiltros({ ...filtros, grupo: e.target.value })}
                  style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)', borderColor: 'var(--color-borde)' }}
                >
                  <option value="">Todos</option>
                  <option value="con_grupo">Con grupo asignado</option>
                  <option value="sin_grupo">Sin grupo asignado</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {hayFiltrosActivos && (
            <div className="mt-3">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={limpiarFiltros}
              >
                <FaTimes className="me-2" />
                Limpiar Filtros
              </Button>
              <span className="text-muted ms-3">
                Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
              </span>
            </div>
          )}
        </Card.Body>
      </Card>
      
      <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
        <Card.Body>
          <Table responsive hover variant="dark">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Grupo/Info</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>
                    {usuario.perfil 
                      ? `${usuario.perfil.nombre} ${usuario.perfil.apellido}`
                      : 'Sin perfil'
                    }
                  </td>
                  <td>{usuario.correo}</td>
                  <td>{obtenerBadgeRol(usuario.rol)}</td>
                  <td>{obtenerBadgeEstado(usuario.estado)}</td>
                  <td>
                    {usuario.rol === Rol.Estudiante && usuario.perfil?.grupo && (
                      <Badge bg="info">{usuario.perfil.grupo.nombre}</Badge>
                    )}
                    {usuario.rol === Rol.Estudiante && !usuario.perfil?.grupo && (
                      <Badge bg="secondary">Sin grupo</Badge>
                    )}
                    {usuario.rol === Rol.Asesor && usuario.perfil?.grupos && (
                      <Badge bg="success">{usuario.perfil.grupos.length} grupo(s)</Badge>
                    )}
                  </td>
                  <td>
                    <small className="text-muted">
                      {new Date(usuario.creado_en).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    {usuario.rol !== Rol.Administrador && (
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => abrirModalCambiarEstado(usuario)}
                      >
                        Cambiar Estado
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {usuariosFiltrados.length === 0 && (
            <p className="text-muted text-center py-5">
              {hayFiltrosActivos 
                ? 'No se encontraron usuarios con los filtros aplicados.'
                : 'No hay usuarios registrados.'}
            </p>
          )}
        </Card.Body>
      </Card>

      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Modal.Title>Cambiar Estado de Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          {usuarioSeleccionado && (
            <>
              <p className="text-light">
                <strong>Usuario:</strong> {usuarioSeleccionado.perfil?.nombre} {usuarioSeleccionado.perfil?.apellido}
              </p>
              <p className="text-light">
                <strong>Correo:</strong> {usuarioSeleccionado.correo}
              </p>
              <p className="text-light">
                <strong>Estado actual:</strong> {obtenerBadgeEstado(usuarioSeleccionado.estado)}
              </p>

              <Form.Group className="mb-3">
                <Form.Label className="text-light">Nuevo Estado</Form.Label>
                <Form.Select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value as EstadoUsuario)}
                  style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                >
                  <option value={EstadoUsuario.Activo}>Activo</option>
                  <option value={EstadoUsuario.Inactivo}>Inactivo</option>
                  <option value={EstadoUsuario.Eliminado}>Eliminado</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={manejarCambiarEstado}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GestionUsuarios;