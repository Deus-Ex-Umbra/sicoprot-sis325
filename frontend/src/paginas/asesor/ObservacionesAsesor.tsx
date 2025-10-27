import { useState, useEffect } from 'react';
import { Card, Table, Alert, Form } from 'react-bootstrap';
import { 
  obtenerObservacionesPorRevisor, 
  actualizarObservacion 
} from '../../servicios/observaciones.servicio';
import type { Observacion } from '../../tipos/observacion';
import { toast } from 'react-toastify';

const ObservacionesAsesor = () => {
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerObservacionesPorRevisor();
        setObservaciones(data);
      } catch (err) {
        setError('Error al cargar observaciones');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);
  const handleEstadoChange = async (id: number, nuevoEstado: 'pendiente' | 'corregido' | 'rechazado') => {
    try {
      await actualizarObservacion(id, { estado: nuevoEstado });
      setObservaciones(prev =>
        prev.map(obs => (obs.id === id ? { ...obs, estado: nuevoEstado } : obs))
      );
      toast.success('Estado actualizado');
    } catch (err) {
      toast.error('Error al actualizar');
    }
};

  if (cargando) return <div>Cargando...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Card style={{ backgroundColor: '#1e1e2d', color: 'white' }}>
      <Card.Header>
        <h4>Mis Observaciones a Estudiantes</h4>
      </Card.Header>
      <Card.Body>
        {observaciones.length === 0 ? (
          <p>No has creado observaciones.</p>
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
                    <td>
                      <Form.Select
                        value={obs.estado || 'pendiente'}
                        onChange={(e) => {
                          const valor = e.target.value as 'pendiente' | 'corregido' | 'rechazado';
                          handleEstadoChange(obs.id, valor);
                        }}
                        style={{ width: '140px' }}
                      >
                        <option value="pendiente">pendiente</option>
                        <option value="corregido">corregido</option>
                        <option value="rechazado">rechazado</option>
                      </Form.Select>
                    </td>
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

export default ObservacionesAsesor;