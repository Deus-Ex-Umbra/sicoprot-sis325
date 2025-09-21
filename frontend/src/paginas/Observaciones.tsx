import { useState, useEffect } from 'react';
import { Card, Table, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { obtenerObservacionesPorDocumento } from '../servicios/observaciones.servicio';
import { type Observacion } from '../tipos/usuario';

const Observaciones = () => {
    const [observaciones, setObservaciones] = useState<Observacion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
  
    useEffect(() => {
      const cargarObservaciones = async () => {
        try {
          // Lógica para obtener observaciones de todos los documentos del usuario
          // Esto requeriría un nuevo endpoint en el backend
          // Por ahora, simularemos con un placeholder
          setObservaciones([]);
        } catch (err) {
          setError('No se pudo cargar la lista de observaciones.');
        } finally {
          setCargando(false);
        }
      };
      cargarObservaciones();
    }, []);
  
    if (cargando) return <p>Cargando observaciones...</p>;
    if (error) return <Alert variant="danger">{error}</Alert>;
  
    return (
      <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
        <Card.Header>
          <h2 className="text-light">Mis Observaciones</h2>
        </Card.Header>
        <Card.Body>
          {observaciones.length > 0 ? (
          <Table responsive hover variant="dark">
            <thead>
              <tr>
                <th>Observación</th>
                <th>Documento</th>
                <th>Página</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {observaciones.map((obs) => (
                <tr key={obs.id} onClick={() => navigate(`/panel/proyecto/${(obs as any).documento.proyecto.id}`)} style={{cursor: 'pointer'}}>
                  <td>{obs.contenido}</td>
                  <td>{(obs as any).documento.nombre_archivo}</td>
                  <td>{obs.pagina_inicio}</td>
                  <td>
                    <Badge bg={obs.estado === 'corregida' ? 'success' : 'warning'}>
                      {obs.estado}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          ) : (
            <p className="text-muted text-center">No tienes observaciones pendientes.</p>
          )}
        </Card.Body>
      </Card>
    );
  };
  
  export default Observaciones;