import { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { obtenerSolicitudesPendientes, responderSolicitud } from '../../servicios/solicitudes.servicio';
import { type SolicitudRegistro, Rol } from '../../tipos/usuario';
import { toast } from 'react-toastify';

const SolicitudesRegistro = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudRegistro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudRegistro | null>(null);
  const [respuesta, setRespuesta] = useState<'aprobada' | 'rechazada'>('aprobada');
  const [comentarios, setComentarios] = useState('');

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const data = await obtenerSolicitudesPendientes();
      setSolicitudes(data);
    } catch (err) {
      setError('Error al cargar las solicitudes');
    } finally {
      setCargando(false);
    }
  };

  const abrirModalResponder = (solicitud: SolicitudRegistro, tipo: 'aprobada' | 'rechazada') => {
    setSolicitudSeleccionada(solicitud);
    setRespuesta(tipo);
    setComentarios('');
    setMostrarModal(true);
  };

  const manejarResponder = async () => {
    if (!solicitudSeleccionada) return;

    try {
      await responderSolicitud(solicitudSeleccionada.id, {
        estado: respuesta,
        comentarios_admin: comentarios || undefined,
      });
      
      toast.success(`Solicitud ${respuesta === 'aprobada' ? 'aprobada' : 'rechazada'} exitosamente`);
      setMostrarModal(false);
      await cargarSolicitudes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al procesar solicitud');
    }
  };

  const obtenerBadgeRol = (rol: Rol) => {
    switch (rol) {
      case Rol.Estudiante:
        return <Badge bg="primary">Estudiante</Badge>;
      case Rol.Asesor:
        return <Badge bg="info">Asesor</Badge>;
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
      <h2 className="text-light mb-4">Solicitudes de Registro Pendientes</h2>
      
      <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
        <Card.Body>
          <Table responsive hover variant="dark">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol Solicitado</th>
                <th>Fecha Solicitud</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td>{solicitud.id}</td>
                  <td>{solicitud.nombre} {solicitud.apellido}</td>
                  <td>{solicitud.correo}</td>
                  <td>{obtenerBadgeRol(solicitud.rol)}</td>
                  <td>
                    <small className="text-muted">
                      {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => abrirModalResponder(solicitud, 'aprobada')}
                      >
                        <FaCheck /> Aprobar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => abrirModalResponder(solicitud, 'rechazada')}
                      >
                        <FaTimes /> Rechazar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {solicitudes.length === 0 && (
            <p className="text-muted text-center py-5">
              No hay solicitudes pendientes.
            </p>
          )}
        </Card.Body>
      </Card>

      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Modal.Title>
            {respuesta === 'aprobada' ? 'Aprobar' : 'Rechazar'} Solicitud
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          {solicitudSeleccionada && (
            <>
              <p className="text-light">
                <strong>Solicitante:</strong> {solicitudSeleccionada.nombre} {solicitudSeleccionada.apellido}
              </p>
              <p className="text-light">
                <strong>Correo:</strong> {solicitudSeleccionada.correo}
              </p>
              <p className="text-light">
                <strong>Rol solicitado:</strong> {obtenerBadgeRol(solicitudSeleccionada.rol)}
              </p>

              <Form.Group className="mb-3">
                <Form.Label className="text-light">
                  Comentarios {respuesta === 'rechazada' ? '(recomendado)' : '(opcional)'}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder={
                    respuesta === 'rechazada' 
                      ? 'Explica el motivo del rechazo...'
                      : 'Mensaje de bienvenida opcional...'
                  }
                  style={{ 
                    backgroundColor: 'var(--color-fondo-secundario)', 
                    color: 'var(--color-texto-principal)' 
                  }}
                />
              </Form.Group>

              <Alert variant={respuesta === 'aprobada' ? 'success' : 'warning'}>
                {respuesta === 'aprobada' 
                  ? '✓ Se creará una cuenta activa para este usuario.'
                  : '⚠ La solicitud será rechazada y el usuario será notificado.'
                }
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant={respuesta === 'aprobada' ? 'success' : 'danger'} 
            onClick={manejarResponder}
          >
            Confirmar {respuesta === 'aprobada' ? 'Aprobación' : 'Rechazo'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SolicitudesRegistro;