import { useState, useEffect } from 'react';
import { Card, Table, Alert, Form, Badge } from 'react-bootstrap';
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

  const handleEstadoChange = async (id: number, nuevoEstado: string) => {
    try {
      await actualizarObservacion(id, { estado: nuevoEstado });
      setObservaciones(prev =>
        prev.map(obs => (obs.id === id ? { ...obs, estado: nuevoEstado } : obs))
      );
      toast.success('Estado actualizado correctamente');
    } catch (err) {
      toast.error('Error al actualizar el estado');
    }
  };

  // Función para obtener color del badge según estado
  const obtenerEstiloBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'warning';
      case 'CORREGIDO': return 'success';
      case 'RECHAZADO': return 'danger';
      default: return 'secondary';
    }
  };

  if (cargando) return <div className="text-center p-5">Cargando observaciones...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Card style={{ backgroundColor: '#1e1e2d', color: 'white' }}>
      <Card.Header>
        <h4>📝 Mis Observaciones a Estudiantes</h4>
        <small className="text-muted">
          Observaciones realizadas: {observaciones.length}
        </small>
      </Card.Header>
      <Card.Body>
        {observaciones.length === 0 ? (
          <Alert variant="info">
            No has creado observaciones todavía.
          </Alert>
        ) : (
          <Table variant="dark" striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Proyecto</th>
                <th>Estudiante</th>
                <th>Documento</th>
                <th>Observación</th>
                <th>Página</th>
                <th>Estado Actual</th>
                <th>Cambiar Estado</th>
              </tr>
            </thead>
            <tbody>
              {observaciones.map((obs) => {
                // ✅ Acceso seguro a datos relacionados
                const proyecto = obs.documento?.proyecto;
                const estudiante = proyecto?.estudiantes?.[0];
                const nombreEstudiante = estudiante 
                  ? `${estudiante.nombre} ${estudiante.apellido}`
                  : '—';
                const tituloProyecto = proyecto?.titulo || 'Sin proyecto';
                const nombreDocumento = obs.documento?.nombre_archivo || 'Sin documento';

                return (
                  <tr key={obs.id}>
                    <td>#{obs.id}</td>
                    <td>
                      <strong>{tituloProyecto}</strong>
                    </td>
                    <td>{nombreEstudiante}</td>
                    <td>
                      <small className="text-muted">{nombreDocumento}</small>
                      <br />
                      <Badge bg="secondary" className="mt-1">
                        v{obs.documento?.version || 1}
                      </Badge>
                    </td>
                    <td>
                      <strong>{obs.titulo || 'Sin título'}</strong>
                      <br />
                      <small className="text-muted">
                        {obs.descripcion_corta || obs.contenido_detallado?.substring(0, 50) + '...'}
                      </small>
                    </td>
                    <td className="text-center">
                      {obs.pagina_inicio}
                    </td>
                    <td className="text-center">
                      <Badge bg={obtenerEstiloBadge(obs.estado)}>
                        {obs.estado}
                      </Badge>
                    </td>
                    <td>
                      <Form.Select
                        value={obs.estado}
                        onChange={(e) => handleEstadoChange(obs.id, e.target.value)}
                        size="sm"
                        style={{ minWidth: '140px' }}
                      >
                        <option value="PENDIENTE">⏳ Pendiente</option>
                        <option value="CORREGIDO">✅ Corregido</option>
                        <option value="RECHAZADO">❌ Rechazado</option>
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
