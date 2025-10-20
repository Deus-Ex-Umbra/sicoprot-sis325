import { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { actualizarPerfil } from '../servicios/perfil.servicio';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaSave } from 'react-icons/fa';

const Perfil = () => {
  const { usuario } = useAutenticacion();
  const [formData, setFormData] = useState({
    nombre: usuario?.perfil?.nombre || '',
    apellido: usuario?.perfil?.apellido || '',
    correo: usuario?.correo || '',
    contrasena_actual: '',
    contrasena_nueva: '',
    confirmar_contrasena: '',
  });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.contrasena_nueva && formData.contrasena_nueva !== formData.confirmar_contrasena) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (formData.contrasena_nueva && formData.contrasena_nueva.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setGuardando(true);

    try {
      const datos_actualizacion: any = {};

      if (formData.correo !== usuario?.correo) {
        datos_actualizacion.correo = formData.correo;
      }

      if (formData.nombre !== usuario?.perfil?.nombre) {
        datos_actualizacion.nombre = formData.nombre;
      }

      if (formData.apellido !== usuario?.perfil?.apellido) {
        datos_actualizacion.apellido = formData.apellido;
      }

      if (formData.contrasena_nueva) {
        datos_actualizacion.contrasena_actual = formData.contrasena_actual;
        datos_actualizacion.contrasena_nueva = formData.contrasena_nueva;
      }

      if (Object.keys(datos_actualizacion).length === 0) {
        setError('No hay cambios para guardar.');
        setGuardando(false);
        return;
      }

      const usuario_actualizado = await actualizarPerfil(datos_actualizacion);
      
      localStorage.setItem('usuario', JSON.stringify(usuario_actualizado));
      
      toast.success('Perfil actualizado exitosamente');
      
      setFormData({
        ...formData,
        contrasena_actual: '',
        contrasena_nueva: '',
        confirmar_contrasena: '',
      });

      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
      toast.error('Error al actualizar el perfil');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <h2 className="text-light mb-4">Mi Perfil</h2>

      <Row>
        <Col lg={8}>
          <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
            <Card.Body>
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

              <Form onSubmit={manejarSubmit}>
                <h5 className="text-light mb-3">
                  <FaUser className="me-2" />
                  Información Personal
                </h5>

                {usuario?.perfil && (
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-light">Nombre</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-light">Apellido</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.apellido}
                          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                          style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                <h5 className="text-light mb-3 mt-4">
                  <FaEnvelope className="me-2" />
                  Credenciales de Acceso
                </h5>

                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                  />
                </Form.Group>

                <h5 className="text-light mb-3 mt-4">
                  <FaLock className="me-2" />
                  Cambiar Contraseña
                </h5>

                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Contraseña Actual</Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.contrasena_actual}
                    onChange={(e) => setFormData({ ...formData, contrasena_actual: e.target.value })}
                    placeholder="Dejar vacío para no cambiar contraseña"
                    style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-light">Nueva Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        value={formData.contrasena_nueva}
                        onChange={(e) => setFormData({ ...formData, contrasena_nueva: e.target.value })}
                        placeholder="Mínimo 8 caracteres"
                        style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-light">Confirmar Nueva Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        value={formData.confirmar_contrasena}
                        onChange={(e) => setFormData({ ...formData, confirmar_contrasena: e.target.value })}
                        placeholder="Repetir nueva contraseña"
                        style={{ backgroundColor: 'var(--color-fondo-secundario)', color: 'var(--color-texto-principal)' }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-grid gap-2 mt-4">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={guardando}
                    size="lg"
                  >
                    <FaSave className="me-2" />
                    {guardando ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
            <Card.Body>
              <h5 className="text-light mb-3">Información de la Cuenta</h5>
              <div className="mb-3">
                <small className="text-muted d-block">Rol</small>
                <strong className="text-light">{usuario?.rol}</strong>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Estado</small>
                <strong className="text-light">{usuario?.estado}</strong>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Fecha de Registro</small>
                <strong className="text-light">
                  {usuario?.creado_en && new Date(usuario.creado_en).toLocaleDateString()}
                </strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Perfil;