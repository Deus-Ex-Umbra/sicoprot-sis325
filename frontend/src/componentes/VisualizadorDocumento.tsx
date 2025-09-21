import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Card, Button, ButtonGroup, Badge, Form, Modal, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight, FaPlus, FaMinus, FaComment, FaEdit } from 'react-icons/fa';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { type Observacion, type Correccion, Rol } from '../tipos/usuario';
import TomSelect from 'tom-select';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Punto {
  x: number;
  y: number;
  pagina: number;
}

interface Props {
  urlDocumento: string;
  documentoId: number;
  observaciones: Observacion[];
  observacionesPendientes: Observacion[];
  correcciones: Correccion[];
  onCrearObservacion?: (observacion: any) => Promise<void>;
  onCrearCorreccion?: (correccion: any) => Promise<void>;
}

const VisualizadorDocumento: React.FC<Props> = ({
  urlDocumento,
  documentoId,
  observaciones,
  observacionesPendientes,
  correcciones,
  onCrearObservacion,
  onCrearCorreccion,
}) => {
  const [numPaginas, setNumPaginas] = useState<number | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [escala, setEscala] = useState(1.5);
  const [modoAnotacion, setModoAnotacion] = useState<'observacion' | 'correccion' | null>(null);
  const [puntoInicio, setPuntoInicio] = useState<Punto | null>(null);
  const [puntoFin, setPuntoFin] = useState<Punto | null>(null);

  const [mostrarModalObservacion, setMostrarModalObservacion] = useState(false);
  const [mostrarModalCorreccion, setMostrarModalCorreccion] = useState(false);
  
  const [tituloAnotacion, setTituloAnotacion] = useState('');
  const [textoAnotacion, setTextoAnotacion] = useState('');
  const [idObservacionAsociada, setIdObservacionAsociada] = useState<number | null>(null);

  const [error, setError] = useState('');
  
  const pageRef = useRef<HTMLDivElement>(null);
  const { usuario } = useAutenticacion();
  const esEstudiante = usuario?.rol === Rol.Estudiante;
  const esAsesor = usuario?.rol === Rol.Asesor;

  useEffect(() => {
    if (mostrarModalCorreccion && observacionesPendientes.length > 0) {
      const select = new TomSelect('#select-observacion', {
        create: false,
        sortField: [{ field: 'text', direction: 'asc' }],
      });
      return () => {
        select.destroy();
      };
    }
  }, [mostrarModalCorreccion, observacionesPendientes]);


  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPaginas(numPages);
  };

  const limpiarEstadoAnotacion = () => {
    setPuntoInicio(null);
    setPuntoFin(null);
    setModoAnotacion(null);
    setTextoAnotacion('');
    setTituloAnotacion('');
    setIdObservacionAsociada(null);
    setError('');
  };

  const manejarClickPagina = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!modoAnotacion) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const pagina = paginaActual;

    if (!puntoInicio) {
      setPuntoInicio({ x, y, pagina });
    } else {
      setPuntoFin({ x, y, pagina });
      if (modoAnotacion === 'observacion') {
        setMostrarModalObservacion(true);
      } else if (modoAnotacion === 'correccion') {
        setMostrarModalCorreccion(true);
      }
    }
  };
  
  const manejarCrearObservacion = async () => {
    if (!puntoInicio || !puntoFin || !tituloAnotacion || !textoAnotacion) {
      setError('El título y la descripción son obligatorios.');
      return;
    }

    const nuevaObservacion = {
      titulo: tituloAnotacion,
      contenido: textoAnotacion,
      x_inicio: puntoInicio.x,
      y_inicio: puntoInicio.y,
      pagina_inicio: puntoInicio.pagina,
      x_fin: puntoFin.x,
      y_fin: puntoFin.y,
      pagina_fin: puntoFin.pagina,
    };

    if (onCrearObservacion) {
      await onCrearObservacion(nuevaObservacion);
      setMostrarModalObservacion(false);
      limpiarEstadoAnotacion();
    }
  };

  const manejarCrearCorreccion = async () => {
    if (!puntoInicio || !puntoFin || !tituloAnotacion || !textoAnotacion || !idObservacionAsociada) {
      setError('Todos los campos son obligatorios y debe seleccionar una observación.');
      return;
    }
    
    const nuevaCorreccion = {
      titulo: tituloAnotacion,
      descripcion: textoAnotacion,
      x_inicio: puntoInicio.x,
      y_inicio: puntoInicio.y,
      pagina_inicio: puntoInicio.pagina,
      x_fin: puntoFin.x,
      y_fin: puntoFin.y,
      pagina_fin: puntoFin.pagina,
      id_observacion: idObservacionAsociada,
      id_documento: documentoId,
    };
    
    if (onCrearCorreccion) {
      await onCrearCorreccion(nuevaCorreccion);
      setMostrarModalCorreccion(false);
      limpiarEstadoAnotacion();
    }
  };


  const renderizarAnotaciones = () => {
    const elementos: JSX.Element[] = [];

    const dibujarRectangulo = (key: string, p1: Punto, p2: Punto, color: string, borde: string, titulo: string) => {
        return (
            <div
                key={key}
                title={titulo}
                style={{
                    position: 'absolute',
                    left: `${Math.min(p1.x, p2.x)}%`,
                    top: `${Math.min(p1.y, p2.y)}%`,
                    width: `${Math.abs(p2.x - p1.x)}%`,
                    height: `${Math.abs(p2.y - p1.y)}%`,
                    backgroundColor: color,
                    border: `2px solid ${borde}`,
                    pointerEvents: 'none',
                }}
            />
        );
    };

    const anotacionesEnPagina = (arr: Array<Observacion | Correccion>) => {
        arr.forEach(item => {
            const esObs = 'contenido' in item;
            const color = esObs ? 'rgba(255, 193, 7, 0.3)' : 'rgba(40, 167, 69, 0.3)';
            const borde = esObs ? '#ffc107' : '#28a745';
            const titulo = esObs ? item.contenido : item.descripcion;

            if (item.pagina_inicio === item.pagina_fin && item.pagina_inicio === paginaActual) {
                elementos.push(dibujarRectangulo(
                    `${esObs ? 'obs' : 'corr'}-${item.id}`,
                    { x: item.x_inicio, y: item.y_inicio, pagina: item.pagina_inicio },
                    { x: item.x_fin, y: item.y_fin, pagina: item.pagina_fin },
                    color, borde, titulo
                ));
            } else {
                if (item.pagina_inicio === paginaActual) {
                    elementos.push(dibujarRectangulo(
                        `${esObs ? 'obs' : 'corr'}-${item.id}-start`,
                        { x: item.x_inicio, y: item.y_inicio, pagina: item.pagina_inicio },
                        { x: 100, y: 100, pagina: item.pagina_inicio },
                        color, borde, `Inicio: ${titulo}`
                    ));
                }
                if (item.pagina_fin === paginaActual) {
                    elementos.push(dibujarRectangulo(
                        `${esObs ? 'obs' : 'corr'}-${item.id}-end`,
                        { x: 0, y: 0, pagina: item.pagina_fin },
                        { x: item.x_fin, y: item.y_fin, pagina: item.pagina_fin },
                        color, borde, `Fin: ${titulo}`
                    ));
                }
            }
        });
    };

    anotacionesEnPagina(observaciones);
    anotacionesEnPagina(correcciones);

    if (puntoInicio && puntoInicio.pagina === paginaActual) {
        elementos.push(<div key="start-marker" style={{ position: 'absolute', left: `${puntoInicio.x}%`, top: `${puntoInicio.y}%`, width: '10px', height: '10px', backgroundColor: 'blue', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />);
    }

    return elementos;
  };
  
  return (
    <Card className="documento-viewer">
       <Card.Header>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <Badge bg="info">
              Página {paginaActual} de {numPaginas || '...'}
            </Badge>
            <Badge bg="secondary">
              Zoom: {Math.round(escala * 100)}%
            </Badge>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            {modoAnotacion && (
                <Badge bg="warning" pill>Modo Anotación</Badge>
            )}
            {esAsesor && (
              <Button
                variant={modoAnotacion === 'observacion' ? 'warning' : 'outline-warning'}
                onClick={() => setModoAnotacion(prev => prev ? null : 'observacion')}
              >
                <FaComment className="me-2" />
                {modoAnotacion === 'observacion' ? 'Cancelar' : 'Observación'}
              </Button>
            )}
            
            {esEstudiante && (
              <Button
                variant={modoAnotacion === 'correccion' ? 'success' : 'outline-success'}
                onClick={() => setModoAnotacion(prev => prev ? null : 'correccion')}
              >
                <FaEdit className="me-2" />
                 {modoAnotacion === 'correccion' ? 'Cancelar' : 'Corrección'}
              </Button>
            )}
          </div>
        </div>
        {modoAnotacion && (
             <Alert variant="info" className="mt-2 mb-0 small">
                {puntoInicio ? 'Haga clic para marcar el punto final.' : 'Haga clic para marcar el punto de inicio.'}
            </Alert>
        )}
      </Card.Header>

      <Card.Body>
        <div className="pdf-controls">
          <ButtonGroup>
            <Button variant="secondary" onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual <= 1}><FaArrowLeft /></Button>
            <Button variant="secondary" disabled>{paginaActual} / {numPaginas}</Button>
            <Button variant="secondary" onClick={() => setPaginaActual(p => Math.min(numPaginas!, p + 1))} disabled={paginaActual >= (numPaginas || 1)}><FaArrowRight /></Button>
          </ButtonGroup>
          <ButtonGroup className="ms-3">
            <Button variant="secondary" onClick={() => setEscala(s => Math.max(0.5, s - 0.25))}><FaMinus /></Button>
            <Button variant="secondary" disabled>{Math.round(escala * 100)}%</Button>
            <Button variant="secondary" onClick={() => setEscala(s => Math.min(3, s + 0.25))}><FaPlus /></Button>
          </ButtonGroup>
        </div>

        <div 
          ref={pageRef}
          style={{ position: 'relative', cursor: modoAnotacion ? 'crosshair' : 'default' }}
          onClick={manejarClickPagina}
        >
          <Document file={urlDocumento} onLoadSuccess={onDocumentLoadSuccess} loading={<div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando PDF...</span></div>}>
            <Page pageNumber={paginaActual} scale={escala} renderTextLayer={false} renderAnnotationLayer={false}/>
          </Document>
          <div className="annotation-layer">{renderizarAnotaciones()}</div>
        </div>
      </Card.Body>

      {/* Modal para Observación */}
      <Modal show={mostrarModalObservacion} onHide={() => { setMostrarModalObservacion(false); limpiarEstadoAnotacion(); }}>
        <Modal.Header closeButton>
          <Modal.Title>Nueva Observación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <p>Marcando desde la página <strong>{puntoInicio?.pagina}</strong> hasta la página <strong>{puntoFin?.pagina}</strong>.</p>
          <Form.Group className="mb-3">
            <Form.Label>Título</Form.Label>
            <Form.Control type="text" value={tituloAnotacion} onChange={(e) => setTituloAnotacion(e.target.value)} placeholder="Ej: Corregir párrafo" />
          </Form.Group>
          <Form.Group>
            <Form.Label>Descripción</Form.Label>
            <Form.Control as="textarea" rows={3} value={textoAnotacion} onChange={(e) => setTextoAnotacion(e.target.value)} placeholder="Escriba su observación aquí..." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setMostrarModalObservacion(false); limpiarEstadoAnotacion(); }}>Cancelar</Button>
          <Button variant="primary" onClick={manejarCrearObservacion}>Crear Observación</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para Corrección */}
      <Modal show={mostrarModalCorreccion} onHide={() => { setMostrarModalCorreccion(false); limpiarEstadoAnotacion(); }}>
        <Modal.Header closeButton>
          <Modal.Title>Nueva Corrección</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
           <p>Marcando desde la página <strong>{puntoInicio?.pagina}</strong> hasta la página <strong>{puntoFin?.pagina}</strong>.</p>
          <Form.Group className="mb-3">
            <Form.Label>Observación a Corregir</Form.Label>
            <select id="select-observacion" onChange={(e) => setIdObservacionAsociada(parseInt(e.target.value))}>
              <option value="">Seleccione una observación...</option>
              {observacionesPendientes.map(obs => (
                  <option key={obs.id} value={obs.id}>
                      {`Pág. ${obs.pagina_inicio}: ${obs.titulo}`}
                  </option>
              ))}
            </select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Título de la Corrección</Form.Label>
            <Form.Control type="text" value={tituloAnotacion} onChange={(e) => setTituloAnotacion(e.target.value)} placeholder="Ej: Párrafo corregido" />
          </Form.Group>
          <Form.Group>
            <Form.Label>Descripción de la Corrección</Form.Label>
            <Form.Control as="textarea" rows={3} value={textoAnotacion} onChange={(e) => setTextoAnotacion(e.target.value)} placeholder="Describa la corrección realizada..." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setMostrarModalCorreccion(false); limpiarEstadoAnotacion(); }}>Cancelar</Button>
          <Button variant="success" onClick={manejarCrearCorreccion}>Crear Corrección</Button>
        </Modal.Footer>
      </Modal>

    </Card>
  );
};

export default VisualizadorDocumento;