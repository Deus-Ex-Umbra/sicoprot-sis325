import { useState, useEffect } from 'react';
import { Card, Table, Alert } from 'react-bootstrap';
import { obtenerProyectos } from '../servicios/proyectos.servicio';
import { type Proyecto } from '../tipos/usuario';

const MisEstudiantes = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const data = await obtenerProyectos();
        setProyectos(data);
      } catch (err) {
        setError('No se pudo cargar la lista de estudiantes.');
      } finally {
        setCargando(false);
      }
    };
    cargarProyectos();
  }, []);

  if (cargando) return <p>Cargando estudiantes...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
      <Card.Header>
        <h2 className="text-light">Mis Estudiantes</h2>
      </Card.Header>
      <Card.Body>
        <Table responsive hover variant="dark">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Proyecto</th>
              <th>Fecha de Inicio</th>
            </tr>
          </thead>
          <tbody>
            {proyectos.map((proyecto) => (
              <tr key={proyecto.id}>
                <td>{proyecto.estudiante?.nombre} {proyecto.estudiante?.apellido}</td>
                <td>{proyecto.titulo}</td>
                <td>{new Date(proyecto.fecha_creacion).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default MisEstudiantes;