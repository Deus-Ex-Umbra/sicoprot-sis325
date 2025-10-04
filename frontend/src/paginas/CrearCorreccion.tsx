import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Alert, Row, Col, Badge } from 'react-bootstrap';
import { Document, Page, pdfjs } from 'react-pdf';
import { FaArrowLeft, FaArrowRight, FaPlus, FaMinus, FaSave } from 'react-icons/fa';
import { crearCorreccion } from '../servicios/correcciones.servicio';
import { obtenerProyectoPorId } from '../servicios/proyectos.servicio';
import { obtenerObservacionesPorProyecto } from '../servicios/observaciones.servicio';
import { type Proyecto, type Documento, type Observacion } from '../tipos/usuario';
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

const CrearCorreccion = () => {
  const { proyectoId } = useParams<{ proyectoId: string }>();
  const navigate = useNavigate();
  
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<Documento | null>(null);
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [numPaginas, setNumPaginas] = useState<number | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [escala, setEscala] = useState(1.5);
  const [dimensionesPagina, setDimensionesPagina] = useState<{ width: number; height: number } | null>(null);
  
  const [puntoInicio, setPuntoInicio] = useState<Punto | null>(null);
  const [puntoFin, setPuntoFin] = useState<Punto | null>(null);
  const [idObservacionSeleccionada, setIdObservacionSeleccionada] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [color, setColor] = useState('#28a745');
  
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  const pageRef = useRef<HTMLDivElement>(null);

  const observacionesPendientes = observaciones.filter(obs => 
    obs.estado === 'pendiente' && !obs.correccion
  );

  const observacionSeleccionada = observaciones.find(obs => obs.id === idObservacionSeleccionada);

  useEffect(() => {
    if (proyectoId) {
      cargarDatos();
    }
  }, [proyectoId]);

  const cargarDatos = async () => {
    try {
      const [proyectoData, obsData] = await Promise.all([
        obtenerProyectoPorId(parseInt(proyectoId!)),
        obtenerObservacionesPorProyecto(parseInt(proyectoId!))
      ]);
      
      setProyecto(proyectoData);
      setObservaciones(obsData);
      
      const documentos = proyectoData.documentos?.sort((a, b) => b.version - a.version) || [];
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
    if (!puntoInicio || !puntoFin || !descripcion || !idObservacionSeleccionada || !documentoSeleccionado) {
      setError('Todos los campos son obligatorios y debe marcar dos puntos en el documento.');
      return;
    }

    setGuardando(true);
    setError('');

    try {
      await crearCorreccion({
        titulo: observacionSeleccionada?.titulo,
        descripcion,
        x_inicio: puntoInicio.x,
        y_inicio: puntoInicio.y,
        pagina_inicio: puntoInicio.pagina,
        x_fin: puntoFin.x,
        y_fin: puntoFin.y,
        pagina_fin: puntoFin.pagina,
        id_observacion: idObservacionSeleccionada,
        id_documento: documentoSeleccionado.id,
        color
      });

      toast.success('Corrección creada exitosamente');
      navigate(`/panel/proyecto/${proyectoId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la corrección');
      toast.error('Error al crear la corrección');
    } finally {
      setGuardando(false);
    }
  };

  const limpiarMarcadores = () => {
    setPuntoInicio(null);
    setPuntoFin(null);
  };

  const manejarSeleccionObservacion = (obsId: number) => {
    setIdObservacionSeleccionada(obsId);
    const obs = observaciones.find(o => o.id === obsId);
    if (obs) {
      setPaginaActual(obs.pagina_inicio);
    }
  };

  const renderizarMarcadores = () => {
    if (!pageRef.current || !dimensionesPagina) return null;

    const contenedor = pageRef.current.querySelector('.react-pdf__Page__canvas');
    if (!contenedor) return null;

    const rect = contenedor.getBoundingClientRect();
    const elementos: JSX.Element[] = [];

    // Mostrar la observación seleccionada
    if (observacionSeleccionada && 
        observacionSeleccionada.pagina_inicio === paginaActual) {
      const x1 = (observacionSeleccionada.x_inicio / 100) * rect.width;
      const y1 = (observacionSeleccionada.y_inicio / 100) * rect.height;
      const x2 = (observacionSeleccionada.x_fin / 100) * rect.width;
      const y2 = (observacionSeleccionada.y_fin / 100) * rect.height;

      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);

      elementos.push(
        <svg
          key="observacion-referencia"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <rect
            x={minX}
            y={minY}
            width={maxX - minX}
            height={maxY - minY}
            fill={observacionSeleccionada.color}
            opacity={0.2}
            stroke={observacionSeleccionada.color}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </svg>
      );
    }

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

  if (observacionesPendientes.length === 0) {
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
            <h2 className="text-light mb-0">Crear Corrección</h2>
          </div>
        </div>
        <Alert variant="info">
          No hay observaciones pendientes de corrección en este proyecto.
        </Alert>
      </div>
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
          <h2 className="text-light mb-0">Crear Corrección</h2>
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
                  {observacionSeleccionada && (
                    <Badge 
                      bg="warning" 
                      text="dark"
                      style={{ backgroundColor: observacionSeleccionada.color }}
                    >
                      Observación: {observacionSeleccionada.titulo}
                    </Badge>
                  )}
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
              <h5 className="mb-0">Datos de la Corrección</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Observación a Corregir</Form.Label>
                  <Form.Select
                    value={idObservacionSeleccionada || ''}
                    onChange={(e) => manejarSeleccionObservacion(parseInt(e.target.value))}
                  >
                    <option value="">Seleccione una observación...</option>
                    {observacionesPendientes.map(obs => (
                      <option key={obs.id} value={obs.id}>
                        Pág. {obs.pagina_inicio}: {obs.titulo}
                      </option>
                    ))}
                  </Form.Select>
                  {observacionSeleccionada && (
                    <Form.Text className="text-muted">
                      <strong>Título (automático):</strong> {observacionSeleccionada.titulo}
                      <br />
                      <strong>Contenido:</strong> {observacionSeleccionada.contenido}
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción de la Corrección</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describa qué corrección realizó..."
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
                    <li>Seleccione la observación que está corrigiendo</li>
                    <li>Haga clic en el documento para marcar el inicio de su corrección</li>
                    <li>Haga clic nuevamente para marcar el final</li>
                    <li>Describa la corrección realizada</li>
                    <li>Guarde la corrección</li>
                  </ol>
                </Alert>

                <div className="d-grid gap-2">
                  <Button
                    variant="success"
                    onClick={manejarGuardar}
                    disabled={guardando || !puntoInicio || !puntoFin || !descripcion || !idObservacionSeleccionada}
                  >
                    <FaSave className="me-2" />
                    {guardando ? 'Guardando...' : 'Guardar Corrección'}
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

export default CrearCorreccion;