import { useState, useEffect } from 'react';
import { Card, Table, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { obtenerObservacionesPorDocumento } from '../servicios/observaciones.servicio';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import CambiarEstadoObservacion from '../componentes/CambiarEstadoObservacion';
import { EstadoObservacion, estadoConfig } from '../tipos/estadoObservacion';
import { Clock, Eye, CheckCircle, XCircle } from 'lucide-react';
import { type Observacion } from '../tipos/usuario';

// Mapeo de iconos
const iconos = {
  'clock': Clock,
  'eye': Eye,
  'check-circle': CheckCircle,
  'x-circle': XCircle
};

const Observaciones = () => {
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { usuario } = useAutenticacion();

  const esAsesor = true; // Temporalmente todos pueden cambiar estados

  useEffect(() => {
    const cargarObservaciones = async () => {
      try {
        // Por ahora mantenemos el comportamiento actual
        // Aquí necesitarías implementar el endpoint correcto según tu lógica
        // Por ejemplo: obtenerObservacionesDelUsuario() para estudiantes
        // u obtenerTodasLasObservaciones() para asesores
        setObservaciones([
          // Datos de ejemplo para mostrar el funcionamiento
          {
            id: 1,
            titulo: "Error en metodología",
            contenido: "La metodología descrita no coincide con los objetivos planteados",
            estado: EstadoObservacion.PENDIENTE,
            pagina_inicio: 15,
            documento: { 
              nombre_archivo: "Capitulo_1.pdf",
              proyecto: { id: 123 }
            }
          },
          {
            id: 2,
            titulo: "Falta de referencias",
            contenido: "Se necesitan más referencias bibliográficas actualizadas",
            estado: EstadoObservacion.EN_REVISION,
            pagina_inicio: 23,
            documento: { 
              nombre_archivo: "Capitulo_2.pdf",
              proyecto: { id: 123 }
            }
          }
        ] as any);
      } catch (err) {
        setError('No se pudo cargar la lista de observaciones.');
      } finally {
        setCargando(false);
      }
    };
    cargarObservaciones();
  }, []);

  const handleCambiarEstado = (observacionId: number, nuevoEstado: string) => {
    // Cambio superficial - solo actualiza el estado local
    setObservaciones(prev => prev.map(obs => 
      obs.id === observacionId ? { ...obs, estado: nuevoEstado } : obs
    ));
  };

  const handleEstadoCambiado = (observacionActualizada: Observacion) => {
    setObservaciones(prev => prev.map(obs => 
      obs.id === observacionActualizada.id ? observacionActualizada : obs
    ));
  };

  if (cargando) return <p>Cargando observaciones...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
      <Card.Header>
        <h2 className="text-light">
          {esAsesor ? 'Gestión de Observaciones' : 'Mis Observaciones'}
        </h2>
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
                {esAsesor && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {observaciones.map((obs) => {
                const estadoInfo = estadoConfig[obs.estado as keyof typeof estadoConfig];
                const IconoEstado = iconos[estadoInfo?.icon as keyof typeof iconos] || Clock;
                
                return (
                  <tr 
                    key={obs.id}
                    style={{cursor: 'default'}}
                  >
                    <td 
                      onClick={() => navigate(`/panel/proyecto/${(obs as any).documento.proyecto.id}`)}
                      style={{cursor: 'pointer'}}
                    >
                      <div>
                        <strong>{obs.titulo}</strong>
                        <br />
                        <small className="text-muted">{obs.contenido}</small>
                      </div>
                    </td>
                    <td 
                      onClick={() => navigate(`/panel/proyecto/${(obs as any).documento.proyecto.id}`)}
                      style={{cursor: 'pointer'}}
                    >
                      {(obs as any).documento.nombre_archivo}
                    </td>
                    <td 
                      onClick={() => navigate(`/panel/proyecto/${(obs as any).documento.proyecto.id}`)}
                      style={{cursor: 'pointer'}}
                    >
                      {obs.pagina_inicio}
                    </td>
                    <td>
                      <Badge className={estadoInfo?.className}>
                        <IconoEstado size={14} className="me-1" />
                        {estadoInfo?.label}
                      </Badge>
                    </td>
                    {esAsesor && (
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          <button 
                            className="btn btn-warning btn-sm"
                            onClick={() => handleCambiarEstado(obs.id, EstadoObservacion.PENDIENTE)}
                            disabled={obs.estado === EstadoObservacion.PENDIENTE}
                          >
                            Pendiente
                          </button>
                          <button 
                            className="btn btn-info btn-sm"
                            onClick={() => handleCambiarEstado(obs.id, EstadoObservacion.EN_REVISION)}
                            disabled={obs.estado === EstadoObservacion.EN_REVISION}
                          >
                            En Revisión
                          </button>
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => handleCambiarEstado(obs.id, EstadoObservacion.CORREGIDO)}
                            disabled={obs.estado === EstadoObservacion.CORREGIDO}
                          >
                            Corregido
                          </button>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleCambiarEstado(obs.id, EstadoObservacion.APROBADO)}
                            disabled={obs.estado === EstadoObservacion.APROBADO}
                          >
                            Aprobado
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCambiarEstado(obs.id, EstadoObservacion.RECHAZADO)}
                            disabled={obs.estado === EstadoObservacion.RECHAZADO}
                          >
                            Rechazado
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <p className="text-muted text-center">
            {esAsesor ? 'No hay observaciones para gestionar.' : 'No tienes observaciones pendientes.'}
          </p>
        )}
      </Card.Body>
    </Card>
  );
};

export default Observaciones;