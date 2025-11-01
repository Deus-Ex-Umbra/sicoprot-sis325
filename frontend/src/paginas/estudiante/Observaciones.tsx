import { useState, useEffect } from 'react';
import { Card, Table, Alert, Badge, ProgressBar } from 'react-bootstrap';
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

  // Calcular estadísticas
  const totalObservaciones = observaciones.length;
  const corregidas = observaciones.filter(o => o.estado === 'CORREGIDO').length;
  const pendientes = observaciones.filter(o => o.estado === 'PENDIENTE').length;
  const rechazadas = observaciones.filter(o => o.estado === 'RECHAZADO').length;
  const porcentajeCompletado = totalObservaciones > 0 
    ? Math.round((corregidas / totalObservaciones) * 100) 
    : 0;

  // Función para obtener color del badge según estado
  const obtenerEstiloBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'warning';
      case 'CORREGIDO': return 'success';
      case 'RECHAZADO': return 'danger';
      default: return 'secondary';
    }
  };

  // Función para obtener icono según estado
  const obtenerIcono = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return '⏳';
      case 'CORREGIDO': return '✅';
      case 'RECHAZADO': return '❌';
      default: return '❓';
    }
  };

  if (cargando) return <div className="text-center p-5">Cargando observaciones...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      {/* Panel de Resumen */}
      <Card style={{ backgroundColor: '#1e1e2d', color: 'white' }} className="mb-4">
        <Card.Body>
          <h5 className="mb-3">📊 Resumen de Observaciones</h5>
          <div className="row text-center">
            <div className="col-md-3">
              <h2 className="text-warning">{pendientes}</h2>
              <small className="text-muted">Pendientes</small>
            </div>
            <div className="col-md-3">
              <h2 className="text-success">{corregidas}</h2>
              <small className="text-muted">Corregidas</small>
            </div>
            <div className="col-md-3">
              <h2 className="text-danger">{rechazadas}</h2>
              <small className="text-muted">Rechazadas</small>
            </div>
            <div className="col-md-3">
              <h2>{totalObservaciones}</h2>
              <small className="text-muted">Total</small>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="d-flex justify-content-between mb-2">
              <span>Progreso de correcciones</span>
              <span className="fw-bold">{porcentajeCompletado}%</span>
            </div>
            <ProgressBar 
              now={porcentajeCompletado} 
              variant={porcentajeCompletado === 100 ? 'success' : 'info'}
              style={{ height: '20px' }}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Lista de Observaciones */}
      <Card style={{ backgroundColor: '#1e1e2d', color: 'white' }}>
        <Card.Header>
          <h4>📝 Mis Observaciones Recibidas</h4>
        </Card.Header>
        <Card.Body>
          {observaciones.length === 0 ? (
            <Alert variant="info">
              ¡Excelente! No tienes observaciones pendientes.
            </Alert>
          ) : (
            <Table variant="dark" striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Proyecto</th>
                  <th>Asesor</th>
                  <th>Documento</th>
                  <th>Observación</th>
                  <th>Página</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {observaciones.map((obs) => {
                  // ✅ Acceso seguro a datos relacionados
                  const proyecto = obs.documento?.proyecto;
                  const asesor = obs.autor;
                  const nombreAsesor = asesor 
                    ? `${asesor.nombre} ${asesor.apellido}`
                    : '—';
                  const tituloProyecto = proyecto?.titulo || 'Sin proyecto';
                  const nombreDocumento = obs.documento?.nombre_archivo || 'Sin documento';

                  return (
                    <tr key={obs.id}>
                      <td>#{obs.id}</td>
                      <td>
                        <strong>{tituloProyecto}</strong>
                      </td>
                      <td>{nombreAsesor}</td>
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
                          {obtenerIcono(obs.estado)} {obs.estado}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Observaciones;
