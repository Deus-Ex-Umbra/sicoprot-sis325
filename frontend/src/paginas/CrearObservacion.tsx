import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Alert, Row, Col, Badge } from 'react-bootstrap';
import { Document, Page, pdfjs } from 'react-pdf';
import { FaArrowLeft, FaArrowRight, FaPlus, FaMinus, FaSave } from 'react-icons/fa';
import { crearObservacion } from '../servicios/observaciones.servicio';
import { obtenerProyectoPorId } from '../servicios/proyectos.servicio';
import { type Proyecto, type Documento } from '../tipos/usuario';
import api from '../servicios/api';
import { toast } from 'react-toastify';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Punto {
  x: number;
  y: number;
  pagina: number;
}

const CrearObservacion = () => {
  const { proyectoId } = useParams<{ proyectoId: string }>();
  const navigate = useNavigate();
  
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<Documento | null>(null);
  const [numPaginas, setNumPaginas] = useState<number | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [escala, setEscala] = useState(1.5);
  const [dimensionesPagina, setDimensionesPagina] = useState<{ width: number; height: number } | null>(null);
  
  const [puntoInicio, setPuntoInicio] = useState<Punto | null>(null);
  const [puntoFin, setPuntoFin] = useState<Punto | null>(null);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [color, setColor] = useState('#FFD700');
  
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (proyectoId) {
      cargarProyecto();
    }
  }, [proyectoId]);

  const cargarProyecto = async () => {
    try {
      const data = await obtenerProyectoPorId(parseInt(proyectoId!));
      setProyecto(data);
      
      const documentos = data.documentos?.sort((a, b) => b.version - a.version) || [];
      if (documentos.length > 0) {
        setDocumentoSeleccionado(documentos[0]);
      }
    } catch (err) {
      setError('Error al cargar el proyecto');
    } finally {
      setCargando(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPaginas(numPages);
  };

  const onPageLoadSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setDimensionesPagina({
      width: viewport.width,
      height: viewport.height
    });
  };

  const manejarClickPagina = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dimensionesPagina) return;

    const contenedor = pageRef.current?.querySelector('.react-pdf__Page__canvas');
    if (!contenedor) return;

    const rect = contenedor.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const pagina = paginaActual;

    if (!puntoInicio) {
      setPuntoInicio({ x, y, pagina });
    } else {
      setPuntoFin({ x, y, pagina });
    }
  };

  const manejarGuardar = async () => {
    if (!puntoInicio || !puntoFin || !titulo || !contenido || !documentoSeleccionado) {
      setError('Todos los campos son obligatorios y debe marcar dos puntos en el documento.');
      return;
    }

    setGuardando(true);
    setError('');

    try {
      await crearObservacion(documentoSeleccionado.id, {
        titulo,
        contenido,
        x_inicio: puntoInicio.x,
        y_inicio: puntoInicio.y,
        pagina_inicio: puntoInicio.pagina,
        x_fin: puntoFin.x,
        y_fin: puntoFin.y,
        pagina_fin: puntoFin.pagina,
        color
      });

      toast.success('Observación creada exitosamente');
      navigate(`/panel/proyecto/${proyectoId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la observación');
      toast.error('Error al crear la observación');
    } finally {
      setGuardando(false);
    }
  };

  const limpiarMarcadores = () => {
    setPuntoInicio(null);
    setPuntoFin(null);
  };

  const renderizarMarcadores = () => {
    if (!pageRef.current || !dimensionesPagina) return null;

    const contenedor = pageRef.current.querySelector('.react-pdf__Page__canvas');
    if (!contenedor) return null;

    const rect = contenedor.getBoundingClientRect();
    const elementos: JSX.Element[] = [];

    if (puntoInicio && puntoInicio.pagina === paginaActual) {
      const x = (puntoInicio.x / 100) * rect.width;
      const y = (puntoInicio.y / 100) * rect.height;
      
      elementos.push(
        <div 
          key="start-marker" 
          style={{ 
            position: 'absolute', 
            left: `${x}px`, 
            top: `${y}px`, 
            width: '16px', 
            height: '16px', 
            backgroundColor: color, 
            borderRadius: '50%', 
            border: '3px solid white',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            zIndex: 100
          }} 
        />
      );
    }

    if (puntoFin && puntoFin.pagina === paginaActual) {
      const x = (puntoFin.x / 100) * rect.width;
      const y = (puntoFin.y / 100) * rect.height;
      
      elementos.push(
        <div 
          key="end-marker" 
          style={{ 
            position: 'absolute', 
            left: `${x}px`, 
            top: `${y}px`, 
            width: '16px', 
            height: '16px', 
            backgroundColor: color, 
            borderRadius: '50%', 
            border: '3px solid white',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            zIndex: 100
          }} 
        />
      );
    }

    return elementos;
  };

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!proyecto || !documentoSeleccionado) {
    return (
      <Alert variant="danger">
        No se pudo cargar el proyecto o no tiene documentos
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button 
            variant="outline-secondary" 
            className="me-3"
            onClick={() => navigate(`/panel/proyecto/${proyectoId}`)}
          >
            <FaArrowLeft className="me-2" />
            Volver
          </Button>
          <h2 className="text-light mb-0">Crear Observación</h2>
        </div>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Row>
        <Col md={8}>
          <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <Badge bg="info">
                    Página {paginaActual} de {numPaginas || '...'}
                  </Badge>
                  <Badge bg="secondary">
                    Zoom: {Math.round(escala * 100)}%
                  </Badge>
                  {puntoInicio && <Badge bg="success">Punto inicio marcado</Badge>}
                  {puntoFin && <Badge bg="success">Punto fin marcado</Badge>}
                </div>
                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" size="sm" onClick={limpiarMarcadores}>
                    Limpiar Marcadores
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="pdf-controls mb-3">
                <div className="d-flex gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => setPaginaActual(p => Math.max(1, p - 1))} 
                    disabled={paginaActual <= 1}
                  >
                    <FaArrowLeft />
                  </Button>
                  <Button variant="secondary" disabled>
                    {paginaActual} / {numPaginas}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setPaginaActual(p => Math.min(numPaginas!, p + 1))} 
                    disabled={paginaActual >= (numPaginas || 1)}
                  >
                    <FaArrowRight />
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setEscala(s => Math.max(0.5, s - 0.25))}
                    className="ms-3"
                  >
                    <FaMinus />
                  </Button>
                  <Button variant="secondary" disabled>
                    {Math.round(escala * 100)}%
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setEscala(s => Math.min(3, s + 0.25))}
                  >
                    <FaPlus />
                  </Button>
                </div>
              </div>

              <div 
                ref={pageRef}
                style={{ 
                  position: 'relative', 
                  display: 'inline-block',
                  cursor: 'crosshair'
                }}
                onClick={manejarClickPagina}
              >
                <Document 
                  file={`${api.defaults.baseURL}/documentos/${documentoSeleccionado.id}/archivo`}
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
                    onLoadSuccess={onPageLoadSuccess}
                  />
                </Document>
                <div 
                  className="annotation-layer"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                  }}
                >
                  {renderizarMarcadores()}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
            <Card.Header>
              <h5 className="mb-0">Datos de la Observación</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Error de redacción"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Contenido</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    placeholder="Describa la observación..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Color</Form.Label>
                  <Form.Control
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </Form.Group>

                <Alert variant="info" className="small">
                  <strong>Instrucciones:</strong>
                  <ol className="mb-0 mt-2">
                    <li>Haga clic en el documento para marcar el punto de inicio</li>
                    <li>Haga clic nuevamente para marcar el punto final</li>
                    <li>Complete el formulario y guarde</li>
                  </ol>
                </Alert>

                <div className="d-grid gap-2">
                  <Button
                    variant="success"
                    onClick={manejarGuardar}
                    disabled={guardando || !puntoInicio || !puntoFin || !titulo || !contenido}
                  >
                    <FaSave className="me-2" />
                    {guardando ? 'Guardando...' : 'Guardar Observación'}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(`/panel/proyecto/${proyectoId}`)}
                  >
                    Cancelar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CrearObservacion;