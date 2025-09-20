import { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { iniciarSesion } from '../servicios/autenticacion.servicio';

const IniciarSesion = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!correo || !contrasena) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    
    try {
      const respuesta = await iniciarSesion({ correo, contrasena });
      console.log('Inicio de sesión exitoso:', respuesta);
      
      // Aquí guardarías el token o la sesión del usuario
      
      navigate('/panel');
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      setError(err.response?.data?.message || 'Error en el servidor.');
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
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </Form.Group>
          <div className="row">
            <div className="col-12">
              <Button variant="primary" type="submit" className="w-100">
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </Form>

        <p className="mt-3 mb-1">
          <a href="#">Olvidé mi contraseña</a>
        </p>
        <p className="mb-0">
          <Link to="/registrarse" className="text-center">
            Registrar una nueva cuenta
          </Link>
        </p>
      </Card.Body>
    </Card>
  );
};

export default IniciarSesion;