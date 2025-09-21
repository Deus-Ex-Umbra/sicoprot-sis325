import { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';

const IniciarSesion = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const { iniciarSesion } = useAutenticacion();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/panel';

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!correo || !contrasena) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    setCargando(true);

    try {
      await iniciarSesion(correo, contrasena);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      setError(err.response?.data?.message || 'Error en el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Card>
      <Card.Body className="login-card-body">
        <p className="login-box-msg">Inicia sesión para continuar</p>
        
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={manejarSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              disabled={cargando}
              autoFocus
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              disabled={cargando}
            />
          </Form.Group>
          
          <div className="row">
            <div className="col-12">
              <Button 
                variant="primary" 
                type="submit" 
                className="w-100"
                disabled={cargando}
              >
                {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </div>
          </div>
        </Form>

        <p className="mb-0 mt-3">
          <Link to="/registrarse" className="text-center">
            Registrar una nueva cuenta
          </Link>
        </p>
      </Card.Body>
    </Card>
  );
};

export default IniciarSesion;