import { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Registro = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre || !apellido || !correo || !contrasena) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    console.log({ nombre, apellido, correo, contrasena });
    // Aquí irá la lógica para llamar a la API
  };

  return (
    <Card>
      <Card.Body className="register-card-body">
        <p className="login-box-msg">Registrar una nueva cuenta</p>
        
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={manejarSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Nombre(s)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Apellido(s)"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
            />
          </Form.Group>
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
                Registrarse
              </Button>
            </div>
          </div>
        </Form>

        <Link to="/iniciar-sesion" className="text-center d-block mt-3">
          Ya tengo una cuenta
        </Link>
      </Card.Body>
    </Card>
  );
};

export default Registro;