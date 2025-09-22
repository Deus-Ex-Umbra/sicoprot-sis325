import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Badge } from 'react-bootstrap';
import { Clock, Eye, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { EstadoObservacion, estadoConfig, type EstadoObservacion as TipoEstadoObservacion } from '../tipos/estadoObservacion';
import { cambiarEstadoObservacion } from '../servicios/observaciones.servicio';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import type { Observacion } from '../tipos/usuario';

interface Props {
    observacion: Observacion;
    onEstadoCambiado: (observacionActualizada: Observacion) => void;
}

// Mapeo de iconos
const iconos = {
    'clock': Clock,
    'eye': Eye,
    'check-circle': CheckCircle,
    'x-circle': XCircle
};

const CambiarEstadoObservacion: React.FC<Props> = ({ 
    observacion, 
    onEstadoCambiado 
}) => {
    const { usuario } = useAutenticacion();
    const [mostrarModal, setMostrarModal] = useState(false);
    const [nuevoEstado, setNuevoEstado] = useState<EstadoObservacion>(
        observacion.estado as EstadoObservacion || EstadoObservacion.PENDIENTE
    );
    const [comentarios, setComentarios] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    // Verificar si el usuario es asesor
    const esAsesor = usuario?.rol === 'asesor';

    const handleCambiarEstado = async () => {
        if (!observacion?.id) {
        setError('ID de observación no válido');
        return;
    }

    setCargando(true);
    setError('');

    try {
        const resultado = await cambiarEstadoObservacion(
            observacion.id,
            nuevoEstado,
            comentarios.trim() || undefined
        );

        toast.success('Estado cambiado exitosamente. El estudiante ha sido notificado.', {
            position: "top-right",
            autoClose: 3000,
        });

        onEstadoCambiado(resultado.observacion);
        handleCerrarModal();

    } catch (err: any) {
        const mensajeError = err.response?.data?.message || 'Error al cambiar el estado';
        setError(mensajeError);
        toast.error(mensajeError, {
            position: "top-right",
            autoClose: 5000,
        });
    } finally {
        setCargando(false);
    }
    };

    const handleAbrirModal = () => {
        setMostrarModal(true);
        setNuevoEstado(observacion.estado as EstadoObservacion || EstadoObservacion.PENDIENTE);
        setComentarios('');
        setError('');
    };

    const handleCerrarModal = () => {
        if (cargando) return;
        setMostrarModal(false);
        setError('');
    };

    if (!observacion) {
        return <Alert variant="danger">Error: Observación no encontrada</Alert>;
    }

    // No mostrar el componente si no es asesor
    if (!esAsesor) {
        return null;
    }

    const estadoActual = estadoConfig[observacion.estado as EstadoObservacion];
    const IconoEstado = iconos[estadoActual?.icon as keyof typeof iconos] || Clock;
    const estadoCambiado = nuevoEstado !== observacion.estado;

    return (
        <>
        {/* Botón para cambiar estado */}
        <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
            <Badge className={estadoActual?.className}>
                <IconoEstado size={14} className="me-1" />
                {estadoActual?.label}
            </Badge>
            </div>
            
            <Button
            variant="primary"
            size="sm"
            onClick={handleAbrirModal}
            >
            Cambiar Estado
            </Button>
        </div>

        {/* Modal */}
        <Modal show={mostrarModal} onHide={handleCerrarModal} size="lg">
            <Modal.Header closeButton>
            <Modal.Title>Cambiar Estado de Observación</Modal.Title>
            </Modal.Header>

            <Modal.Body>
            {/* Información de la observación */}
            <div className="mb-4 p-3 bg-light rounded">
                <h6 className="fw-bold text-dark mb-2">
                {observacion.titulo}
                </h6>
                <p className="text-muted mb-2">
                {observacion.contenido.length > 100 
                    ? `${observacion.contenido.substring(0, 100)}...`
                    : observacion.contenido
                }
                </p>
                <div className="d-flex align-items-center gap-2">
                <small className="text-muted">Estado actual:</small>
                <Badge className={estadoActual?.className}>
                    <IconoEstado size={12} className="me-1" />
                    {estadoActual?.label}
                </Badge>
                </div>
            </div>

            {/* Selector de nuevo estado */}
            <Form.Group className="mb-3">
                <Form.Label>Nuevo Estado</Form.Label>
                <Form.Select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value as TipoEstadoObservacion)}
                disabled={cargando}
                >
                {(Object.values(EstadoObservacion) as TipoEstadoObservacion[]).map((valor) => {
                    const config = estadoConfig[valor];
                    return (
                    <option key={valor} value={valor}>
                        {config?.label || valor}
                    </option>
                    );
                })}
                </Form.Select>
            </Form.Group>

            {/* Campo de comentarios */}
            <Form.Group className="mb-3">
                <Form.Label>
                <MessageSquare size={16} className="me-2" />
                Comentarios para el Estudiante (Opcional)
                </Form.Label>
                <Form.Control
                as="textarea"
                rows={4}
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                disabled={cargando}
                placeholder="Agregue comentarios para guiar al estudiante..."
                maxLength={500}
                />
                <Form.Text className="text-muted">
                {comentarios.length}/500 caracteres
                </Form.Text>
            </Form.Group>

            {/* Mensaje de error */}
            {error && (
                <Alert variant="danger" className="mb-3">
                <strong>Error:</strong> {error}
                </Alert>
            )}

            {/* Nota informativa */}
            <Alert variant="info" className="mb-0">
                <strong>💡 Nota:</strong> El estudiante recibirá una notificación automática 
                cuando se cambie el estado de esta observación.
            </Alert>
            </Modal.Body>

            <Modal.Footer>
            <Button 
                variant="secondary" 
                onClick={handleCerrarModal}
                disabled={cargando}
            >
                Cancelar
            </Button>
            <Button 
                variant="primary" 
                onClick={handleCambiarEstado}
                disabled={cargando || !estadoCambiado}
            >
                {cargando ? 'Cambiando...' : 'Confirmar Cambio'}
            </Button>
            </Modal.Footer>
        </Modal>
        </>
    );
};

export default CambiarEstadoObservacion;