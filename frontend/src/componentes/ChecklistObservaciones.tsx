import { Card, ProgressBar, ListGroup, Badge, Alert } from 'react-bootstrap';
import { CheckCircle, Clock, Eye, XCircle, AlertCircle } from 'lucide-react';
import { type Observacion } from '../tipos/usuario';
import { estadoConfig } from '../tipos/estadoObservacion';

interface Props {
  observaciones: Observacion[];
}

const iconos = {
  'clock': Clock,
  'eye': Eye,
  'check-circle': CheckCircle,
  'x-circle': XCircle
};

const ChecklistObservaciones: React.FC<Props> = ({ observaciones }) => {
  const total = observaciones.length;
  
  const por_estado = {
    pendiente: observaciones.filter(o => o.estado === 'pendiente').length,
    en_revision: observaciones.filter(o => o.estado === 'en_revision').length,
    corregido: observaciones.filter(o => o.estado === 'corregido').length,
    aprobado: observaciones.filter(o => o.estado === 'aprobado').length,
    rechazado: observaciones.filter(o => o.estado === 'rechazado').length,
  };

  const completadas = por_estado.aprobado;
  const porcentaje_completado = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const pendientes_atencion = por_estado.pendiente + por_estado.rechazado;
  const en_proceso = por_estado.en_revision + por_estado.corregido;

  return (
    <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
      <Card.Header>
        <h5 className="mb-0">
          <AlertCircle className="me-2" size={20} />
          Checklist de Observaciones
        </h5>
      </Card.Header>
      <Card.Body>
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong className="text-light">Progreso General</strong>
            <span className="text-light">{completadas} de {total} completadas</span>
          </div>
          <ProgressBar>
            <ProgressBar 
              variant="success" 
              now={porcentaje_completado} 
              label={`${porcentaje_completado}%`}
              key={1}
            />
          </ProgressBar>
        </div>

        {total === 0 ? (
          <Alert variant="info" className="mb-0">
            No tienes observaciones registradas todavía.
          </Alert>
        ) : (
          <>
            <ListGroup variant="flush">
              {pendientes_atencion > 0 && (
                <ListGroup.Item 
                  style={{ backgroundColor: 'var(--color-fondo-secundario)', border: 'none' }}
                  className="border-start border-warning border-3 mb-2"
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <AlertCircle className="text-warning me-2" size={18} />
                      <strong className="text-light">Requieren tu atención</strong>
                      <p className="text-muted small mb-0">
                        Observaciones pendientes de corregir o rechazadas
                      </p>
                    </div>
                    <Badge bg="warning" text="dark" className="fs-6">
                      {pendientes_atencion}
                    </Badge>
                  </div>
                </ListGroup.Item>
              )}

              {en_proceso > 0 && (
                <ListGroup.Item 
                  style={{ backgroundColor: 'var(--color-fondo-secundario)', border: 'none' }}
                  className="border-start border-info border-3 mb-2"
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Eye className="text-info me-2" size={18} />
                      <strong className="text-light">En proceso de revisión</strong>
                      <p className="text-muted small mb-0">
                        Observaciones en revisión o ya corregidas
                      </p>
                    </div>
                    <Badge bg="info" className="fs-6">
                      {en_proceso}
                    </Badge>
                  </div>
                </ListGroup.Item>
              )}

              {completadas > 0 && (
                <ListGroup.Item 
                  style={{ backgroundColor: 'var(--color-fondo-secundario)', border: 'none' }}
                  className="border-start border-success border-3 mb-2"
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <CheckCircle className="text-success me-2" size={18} />
                      <strong className="text-light">Completadas y aprobadas</strong>
                      <p className="text-muted small mb-0">
                        Observaciones superadas exitosamente
                      </p>
                    </div>
                    <Badge bg="success" className="fs-6">
                      {completadas}
                    </Badge>
                  </div>
                </ListGroup.Item>
              )}
            </ListGroup>

            <div className="mt-4 p-3" style={{ backgroundColor: 'var(--color-fondo-secundario)', borderRadius: '8px' }}>
              <h6 className="text-light mb-3">Resumen por Estado</h6>
              <div className="d-flex flex-wrap gap-2">
                {Object.entries(por_estado).map(([estado, cantidad]) => {
                  if (cantidad === 0) return null;
                  const config = estadoConfig[estado as keyof typeof estadoConfig];
                  const Icono = iconos[config?.icon as keyof typeof iconos] || Clock;
                  
                  return (
                    <div key={estado} className="d-flex align-items-center">
                      <Badge className={config?.className}>
                        <Icono size={14} className="me-1" />
                        {config?.label}: {cantidad}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ChecklistObservaciones;