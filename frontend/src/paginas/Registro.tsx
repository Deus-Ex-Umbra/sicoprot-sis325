import { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { Rol } from '../tipos/usuario';

const Registro = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [rol, setRol] = useState<Rol>(Rol.Estudiante);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const { registrarse } = useAutenticacion();
  const navigate = useNavigate();

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre || !apellido || !correo || !contrasena || !confirmarContrasena) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);

    try {
      await registrarse({
        nombre,
        apellido,
        correo,
        contrasena,
        rol,
      });
      navigate('/panel');
    } catch (err: any) {
      console.error('Error al registrarse:', err);
      setError(err.response?.data?.message || 'Error en el servidor.');
    } finally {
      setCargando(false);
    }
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
              disabled={cargando}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Apellido(s)"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              disabled={cargando}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              disabled={cargando}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Select
              value={rol}
              onChange={(e) => setRol(e.target.value as Rol)}
              disabled={cargando}
            >
              <option value={Rol.Estudiante}>Estudiante</option>
              <option value={Rol.Asesor}>Asesor</option>
            </Form.Select>
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
          
          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
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
                {cargando ? 'Registrando...' : 'Registrarse'}
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