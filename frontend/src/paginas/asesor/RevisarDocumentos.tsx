import { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { obtenerProyectos } from '../servicios/proyectos.servicio';
import { type Proyecto } from '../tipos/usuario';

const RevisarDocumentos = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const data = await obtenerProyectos();
        setProyectos(data.filter(p => p.documentos && p.documentos.length > 0));
      } catch (err) {
        setError('No se pudo cargar la lista de documentos a revisar.');
      } finally {
        setCargando(false);
      }
    };
    cargarProyectos();
  }, []);

  if (cargando) return <p>Cargando documentos...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
      <Card.Header>
        <h2 className="text-light">Revisar Documentos</h2>
      </Card.Header>
      <Card.Body>
        <Table responsive hover variant="dark">
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Estudiante</th>
              <th>Última Versión</th>
              <th>Fecha de Subida</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proyectos.map((proyecto) => {
              const ultimoDocumento = proyecto.documentos?.[0];
              return (
                <tr key={proyecto.id}>
                  <td>{proyecto.titulo}</td>
                  <td>{proyecto.estudiante?.nombre} {proyecto.estudiante?.apellido}</td>
                  <td>
                    <Badge bg="primary">Versión {ultimoDocumento?.version}</Badge>
                  </td>
                  <td>{ultimoDocumento ? new Date(ultimoDocumento.fecha_subida).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <Button variant="primary" size="sm" onClick={() => navigate(`/panel/proyecto/${proyecto.id}`)}>
                      Revisar
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default RevisarDocumentos;