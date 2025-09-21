import { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Card, Button, ButtonGroup, Badge, Form, Modal, Alert } from 'react-bootstrap';
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaPlus, 
  FaMinus, 
  FaComment, 
  FaEdit,
} from 'react-icons/fa';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { type Observacion, type Correccion, Rol } from '../tipos/usuario';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  urlDocumento: string;
  documentoId: number;
  observaciones: Observacion[];
  correcciones: Correccion[];
  onCrearObservacion?: (observacion: any) => void;
  onCrearCorreccion?: (correccion: any) => void;
}

const VisualizadorDocumento: React.FC<Props> = ({
  urlDocumento,
  documentoId,
  observaciones,
  correcciones,
  onCrearObservacion,
  onCrearCorreccion,
}) => {
  const [numPaginas, setNumPaginas] = useState<number | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [escala, setEscala] = useState(1.0);
  const [modoAnotacion, setModoAnotacion] = useState(false);
  const [puntoInicio, setPuntoInicio] = useState<{ x: number; y: number } | null>(null);
  const [puntoFin, setPuntoFin] = useState<{ x: number; y: number } | null>(null);
  const [mostrarModalObservacion, setMostrarModalObservacion] = useState(false);
  const [mostrarModalCorreccion, setMostrarModalCorreccion] = useState(false);
  const [textoObservacion, setTextoObservacion] = useState('');
  const [textoCorreccion, setTextoCorreccion] = useState('');
  const [observacionSeleccionada, setObservacionSeleccionada] = useState<Observacion | null>(null);
  const [error, setError] = useState('');
  
  const pageRef = useRef<HTMLDivElement>(null);
  const { usuario } = useAutenticacion();
  const esEstudiante = usuario?.rol === Rol.Estudiante;
  const esAsesor = usuario?.rol === Rol.Asesor;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPaginas(numPages);
  };

  const manejarClickPagina = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!modoAnotacion) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (!puntoInicio) {
      setPuntoInicio({ x, y });
    } else if (!puntoFin) {
      setPuntoFin({ x, y });
      if (esAsesor) {
        setMostrarModalObservacion(true);
      } else if (esEstudiante && observacionSeleccionada) {
        setMostrarModalCorreccion(true);
      }
      setModoAnotacion(false);
    }
  };

  const crearObservacion = async () => {
    if (!puntoInicio || !puntoFin || !textoObservacion) {
      setError('Complete todos los campos');
      return;
    }

    const nuevaObservacion = {
      contenido: textoObservacion,
      x_inicio: puntoInicio.x,
      y_inicio: puntoInicio.y,
      x_fin: puntoFin.x,
      y_fin: puntoFin.y,
      pagina_inicio: paginaActual,
      pagina_fin: paginaActual,
    };

    if (onCrearObservacion) {
      await onCrearObservacion(nuevaObservacion);
    }

    limpiarAnotacion();
    setMostrarModalObservacion(false);
  };

  const crearCorreccion = async () => {
    if (!puntoInicio || !puntoFin || !textoCorreccion || !observacionSeleccionada) {
      setError('Complete todos los campos');
      return;
    }

    const nuevaCorreccion = {
      descripcion: textoCorreccion,
      x_inicio: puntoInicio.x,
      y_inicio: puntoInicio.y,
      x_fin: puntoFin.x,
      y_fin: puntoFin.y,
      pagina_inicio: paginaActual,
      pagina_fin: paginaActual,
      id_observacion: observacionSeleccionada.id,
      id_documento: documentoId,
    };

    if (onCrearCorreccion) {
      await onCrearCorreccion(nuevaCorreccion);
    }

    limpiarAnotacion();
    setMostrarModalCorreccion(false);
  };

  const limpiarAnotacion = () => {
    setPuntoInicio(null);
    setPuntoFin(null);
    setTextoObservacion('');
    setTextoCorreccion('');
    setObservacionSeleccionada(null);
    setError('');
  };

  const renderizarAnotaciones = () => {
    const anotacionesPagina = observaciones.filter(
      obs => obs.pagina_inicio <= paginaActual && obs.pagina_fin >= paginaActual
    );
    
    const correccionesPagina = correcciones.filter(
      cor => cor.pagina_inicio <= paginaActual && cor.pagina_fin >= paginaActual
    );

    return (
      <>
        {anotacionesPagina.map((obs) => (
          <div
            key={`obs-${obs.id}`}
            className="annotation-marker"
            style={{
              left: `${obs.x_inicio}%`,
              top: `${obs.y_inicio}%`,
              width: `${Math.abs(obs.x_fin - obs.x_inicio)}%`,
              height: `${Math.abs(obs.y_fin - obs.y_inicio)}%`,
              backgroundColor: obs.estado === 'corregida' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 235, 59, 0.3)',
              border: `2px solid ${obs.estado === 'corregida' ? '#4caf50' : '#ffc107'}`,
            }}
            title={obs.contenido}
            onClick={() => {
              if (esEstudiante && obs.estado === 'pendiente') {
                setObservacionSeleccionada(obs);
                setModoAnotacion(true);
              }
            }}
          />
        ))}
        
        {correccionesPagina.map((cor) => (
          <div
            key={`cor-${cor.id}`}
            className="annotation-marker correccion"
            style={{
              left: `${cor.x_inicio}%`,
              top: `${cor.y_inicio}%`,
              width: `${Math.abs(cor.x_fin - cor.x_inicio)}%`,
              height: `${Math.abs(cor.y_fin - cor.y_inicio)}%`,
            }}
            title={cor.descripcion}
          />
        ))}

        {puntoInicio && puntoFin && (
          <div
            className="annotation-marker"
            style={{
              left: `${Math.min(puntoInicio.x, puntoFin.x)}%`,
              top: `${Math.min(puntoInicio.y, puntoFin.y)}%`,
              width: `${Math.abs(puntoFin.x - puntoInicio.x)}%`,
              height: `${Math.abs(puntoFin.y - puntoInicio.y)}%`,
              backgroundColor: 'rgba(33, 150, 243, 0.3)',
              border: '2px dashed #2196F3',
            }}
          />
        )}
      </>
    );
  };

  return (
    <Card className="documento-viewer">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <Badge bg="info" className="me-2">
              Página {paginaActual} de {numPaginas || '...'}
            </Badge>
            <Badge bg="secondary">
              Zoom: {Math.round(escala * 100)}%
            </Badge>
          </div>
          
          <ButtonGroup>
            {esAsesor && (
              <Button
                variant={modoAnotacion ? 'warning' : 'outline-warning'}
                onClick={() => {
                  setModoAnotacion(!modoAnotacion);
                  limpiarAnotacion();
                }}
              >
                <FaComment className="me-2" />
                {modoAnotacion ? 'Cancelar' : 'Agregar Observación'}
              </Button>
            )}
            
            {esEstudiante && (
              <Button
                variant="outline-success"
                onClick={() => setModoAnotacion(true)}
              >
                <FaEdit className="me-2" />
                Agregar Corrección
              </Button>
            )}
          </ButtonGroup>
        </div>
      </Card.Header>

      <Card.Body>
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        
        <div className="pdf-controls">
          <ButtonGroup>
            <Button 
              variant="secondary" 
              onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
              disabled={paginaActual <= 1}
            >
              <FaArrowLeft />
            </Button>
            <Button variant="secondary" disabled>
              {paginaActual} / {numPaginas}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setPaginaActual(prev => Math.min(numPaginas || prev, prev + 1))}
              disabled={paginaActual >= (numPaginas || 1)}
            >
              <FaArrowRight />
            </Button>
          </ButtonGroup>

          <ButtonGroup className="ms-3">
            <Button 
              variant="secondary"
              onClick={() => setEscala(prev => Math.max(0.5, prev - 0.25))}
            >
              <FaMinus />
            </Button>
            <Button variant="secondary" disabled>
              {Math.round(escala * 100)}%
            </Button>
            <Button 
              variant="secondary"
              onClick={() => setEscala(prev => Math.min(2, prev + 0.25))}
            >
              <FaPlus />
            </Button>
          </ButtonGroup>
        </div>

        <div 
          ref={pageRef}
          style={{ 
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            cursor: modoAnotacion ? 'crosshair' : 'default',
          }}
          onClick={manejarClickPagina}
        >
          <Document
            file={urlDocumento}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando PDF...</span>
              </div>
            }
          >
            <Page
              pageNumber={paginaActual}
              scale={escala}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
          
          <div className="annotation-layer">
            {renderizarAnotaciones()}
          </div>
        </div>
      </Card.Body>

      <Modal show={mostrarModalObservacion} onHide={() => setMostrarModalObservacion(false)}>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Modal.Title>Nueva Observación</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Form.Group>
            <Form.Label>Descripción de la observación</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={textoObservacion}
              onChange={(e) => setTextoObservacion(e.target.value)}
              placeholder="Escriba su observación aquí..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Button variant="secondary" onClick={() => {
            setMostrarModalObservacion(false);
            limpiarAnotacion();
          }}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={crearObservacion}>
            Crear Observación
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={mostrarModalCorreccion} onHide={() => setMostrarModalCorreccion(false)}>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Modal.Title>Nueva Corrección</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          {observacionSeleccionada && (
            <Alert variant="info">
              Respondiendo a: "{observacionSeleccionada.contenido}"
            </Alert>
          )}
          <Form.Group>
            <Form.Label>Descripción de la corrección</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={textoCorreccion}
              onChange={(e) => setTextoCorreccion(e.target.value)}
              placeholder="Describa la corrección realizada..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
          <Button variant="secondary" onClick={() => {
            setMostrarModalCorreccion(false);
            limpiarAnotacion();
          }}>
            Cancelar
          </Button>
          <Button variant="success" onClick={crearCorreccion}>
            Crear Corrección
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default VisualizadorDocumento;