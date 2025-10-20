import { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { FaUserCheck, FaUserTimes, FaUserSlash, FaTrash } from 'react-icons/fa';
import { obtenerTodosUsuarios, cambiarEstadoUsuario } from '../../servicios/administracion.servicio';
import { type Usuario, EstadoUsuario, Rol } from '../../tipos/usuario';
import { toast } from 'react-toastify';

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoUsuario>(EstadoUsuario.Activo);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await obtenerTodosUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError('Error al cargar los usuarios');
    } finally {
      setCargando(false);
    }
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
              {usuarios.map((usuario) => (
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

          {usuarios.length === 0 && (
            <p className="text-muted text-center py-5">
              No hay usuarios registrados.
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