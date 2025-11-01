import { useState, useEffect } from 'react';
import { Card, Table, Alert } from 'react-bootstrap';
import { obtenerObservacionesPorEstudiante } from '../../servicios/observaciones.servicio';
import type { Observacion } from '../../tipos/observacion';

const Observaciones = () => {
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerObservacionesPorEstudiante();
        setObservaciones(data);
      } catch (err) {
        setError('Error al cargar observaciones');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) return <div>Cargando...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Card style={{ backgroundColor: '#1e1e2d', color: 'white' }}>
      <Card.Header>
        <h4>Mis Observaciones</h4>
      </Card.Header>
      <Card.Body>
        {observaciones.length === 0 ? (
          <p>No tienes observaciones.</p>
        ) : (
          <Table variant="dark" striped bordered>
            <thead>
              <tr>
                <th>ID Doc</th>
                <th>Documento PDF</th>
                <th>Estudiante</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {observaciones.map((obs) => {
                const nombreEstudiante = 
                  obs.documento?.proyecto?.estudiantes?.[0]?.usuario?.nombre || '—';
                return (
                  <tr key={obs.id}>
                    <td>#{obs.documento?.id || '—'}</td>
                    <td>{obs.documento?.titulo || 'Sin título'}</td>
                    <td>{nombreEstudiante}</td>
                    <td>{obs.estado || 'pendiente'}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default Observaciones;