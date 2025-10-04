import { useState, useEffect } from 'react';
import { Card, Table, Alert, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { obtenerProyectos } from '../servicios/proyectos.servicio';
import { type Proyecto } from '../tipos/usuario';
import { FaEye, FaProjectDiagram } from 'react-icons/fa';

const MisEstudiantes = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    cargarProyectos();
  }, []);

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
      <h2 className="text-light mb-4">Mis Estudiantes</h2>
      
      <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
        <Card.Body>
          <Table responsive hover variant="dark">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Proyecto</th>
                <th>Documentos</th>
                <th>Fecha de Inicio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((proyecto) => (
                <tr key={proyecto.id}>
                  <td>
                    <strong>
                      {proyecto.estudiante?.nombre} {proyecto.estudiante?.apellido}
                    </strong>
                  </td>
                  <td>{proyecto.titulo}</td>
                  <td>
                    <Badge bg="info">
                      {proyecto.documentos?.length || 0} documento(s)
                    </Badge>
                  </td>
                  <td>
                    <small className="text-muted">
                      {new Date(proyecto.fecha_creacion).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate(`/panel/proyecto/${proyecto.id}`)}
                    >
                      <FaEye className="me-1" />
                      Ver Proyecto
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {proyectos.length === 0 && (
            <p className="text-muted text-center py-5">
              No tienes estudiantes asignados.
            </p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default MisEstudiantes;