import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Card, Button, ButtonGroup, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight, FaPlus, FaMinus } from 'react-icons/fa';
import { type Observacion, type Correccion } from '../tipos/usuario';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  urlDocumento: string;
  observaciones: Observacion[];
  correcciones: Correccion[];
  observacionSeleccionada?: number | null;
  correccionSeleccionada?: number | null;
}

const VisualizadorDocumento: React.FC<Props> = ({
  urlDocumento,
  observaciones,
  correcciones,
  observacionSeleccionada,
  correccionSeleccionada,
}) => {
  const [numPaginas, setNumPaginas] = useState<number | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [escala, setEscala] = useState(1.5);
  const [dimensionesPagina, setDimensionesPagina] = useState<{ width: number; height: number } | null>(null);
  const [hoveredAnotacion, setHoveredAnotacion] = useState<string | null>(null);
  
  const pageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (observacionSeleccionada) {
      const obs = observaciones.find(o => o.id === observacionSeleccionada);
      if (obs && obs.pagina_inicio !== paginaActual) {
        setPaginaActual(obs.pagina_inicio);
      }
    }
  }, [observacionSeleccionada, observaciones]);

  useEffect(() => {
    if (correccionSeleccionada) {
      const corr = correcciones.find(c => c.id === correccionSeleccionada);
      if (corr && corr.pagina_inicio !== paginaActual) {
        setPaginaActual(corr.pagina_inicio);
      }
    }
  }, [correccionSeleccionada, correcciones]);

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

  const dibujarCorchete = (
    x: number, 
    y: number, 
    orientacion: 'izquierda' | 'derecha',
    esHover: boolean,
    color: string,
    titulo: string
  ) => {
    const tamano = 25;
    const grosor = esHover ? 4 : 3;
    const colorFinal = esHover ? '#ffffff' : color;
    
    const corchete = orientacion === 'izquierda' ? (
      <path
        d={`M ${x + tamano/2} ${y - tamano} L ${x} ${y - tamano} L ${x} ${y + tamano} L ${x + tamano/2} ${y + tamano}`}
        fill="none"
        stroke={colorFinal}
        strokeWidth={grosor}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d={`M ${x - tamano/2} ${y - tamano} L ${x} ${y - tamano} L ${x} ${y + tamano} L ${x - tamano/2} ${y + tamano}`}
        fill="none"
        stroke={colorFinal}
        strokeWidth={grosor}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );

    const tooltipContent = (
      <Tooltip id={`tooltip-${orientacion}-${titulo}`}>
        <strong>{titulo}</strong>
      </Tooltip>
    );

    return (
      <OverlayTrigger placement="top" overlay={tooltipContent}>
        <g style={{ cursor: 'pointer' }}>
          {corchete}
        </g>
      </OverlayTrigger>
    );
  };

  const renderizarAnotaciones = () => {
    if (!pageRef.current || !dimensionesPagina) return null;

    const contenedor = pageRef.current.querySelector('.react-pdf__Page__canvas');
    if (!contenedor) return null;

    const rect = contenedor.getBoundingClientRect();
    const elementos: JSX.Element[] = [];

    const dibujarMarcador = (
      key: string,
      anotacion: Observacion | Correccion,
      color: string,
      titulo: string,
      contenido: string,
      tipo: 'observacion' | 'correccion',
      idItem: number
    ) => {
      const { x_inicio, y_inicio, x_fin, y_fin, pagina_inicio, pagina_fin } = anotacion;

      if (pagina_inicio !== paginaActual && pagina_fin !== paginaActual) return;

      const keyId = `${tipo}-${idItem}`;
      const esHover = hoveredAnotacion === keyId;
      const esSeleccionado = 
        (tipo === 'observacion' && observacionSeleccionada === idItem) ||
        (tipo === 'correccion' && correccionSeleccionada === idItem);

      let x1Porcentaje = x_inicio;
      let y1Porcentaje = y_inicio;
      let x2Porcentaje = x_fin;
      let y2Porcentaje = y_fin;

      if (pagina_inicio !== pagina_fin) {
        if (pagina_inicio === paginaActual) {
          x2Porcentaje = 100;
          y2Porcentaje = 100;
        } else if (pagina_fin === paginaActual) {
          x1Porcentaje = 0;
          y1Porcentaje = 0;
        }
      }

      const x1 = (x1Porcentaje / 100) * rect.width;
      const y1 = (y1Porcentaje / 100) * rect.height;
      const x2 = (x2Porcentaje / 100) * rect.width;
      const y2 = (y2Porcentaje / 100) * rect.height;

      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      const centroY = (minY + maxY) / 2;

      elementos.push(
        <svg
          key={key}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: esSeleccionado ? 1000 : 10,
          }}
        >
          <defs>
            <filter id={`glow-${keyId}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {esHover && (
            <rect
              x={minX}
              y={minY}
              width={maxX - minX}
              height={maxY - minY}
              fill={color}
              opacity={0.15}
            />
          )}

          <g 
            style={{ 
              filter: esSeleccionado ? `url(#glow-${keyId})` : 'none',
              opacity: esSeleccionado ? 1 : 0.85,
              pointerEvents: 'all'
            }}
            onMouseEnter={() => setHoveredAnotacion(keyId)}
            onMouseLeave={() => setHoveredAnotacion(null)}
          >
            {dibujarCorchete(minX, centroY, 'izquierda', esHover || esSeleccionado, color, titulo)}
            {dibujarCorchete(maxX, centroY, 'derecha', esHover || esSeleccionado, color, titulo)}
          </g>

          {esHover && (
            <line
              x1={minX}
              y1={centroY}
              x2={maxX}
              y2={centroY}
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="5 3"
              opacity={0.6}
            />
          )}
        </svg>
      );

      const tooltipContent = (
        <Tooltip id={`tooltip-${keyId}`}>
          <div style={{ textAlign: 'left' }}>
            <strong>{titulo}</strong>
            <div style={{ fontSize: '0.85em', marginTop: '4px' }}>
              {contenido.length > 100 ? `${contenido.substring(0, 100)}...` : contenido}
            </div>
          </div>
        </Tooltip>
      );

      elementos.push(
        <OverlayTrigger
          key={`${key}-hover`}
          placement="top"
          overlay={tooltipContent}
        >
          <div
            onMouseEnter={() => setHoveredAnotacion(keyId)}
            onMouseLeave={() => setHoveredAnotacion(null)}
            style={{
              position: 'absolute',
              left: `${minX}px`,
              top: `${minY}px`,
              width: `${maxX - minX}px`,
              height: `${maxY - minY}px`,
              cursor: 'pointer',
              zIndex: esSeleccionado ? 999 : 5,
            }}
          />
        </OverlayTrigger>
      );
    };

    observaciones.forEach(obs => {
      dibujarMarcador(
        `obs-${obs.id}`,
        obs,
        obs.color,
        obs.titulo,
        obs.contenido,
        'observacion',
        obs.id
      );
    });

    correcciones.forEach(corr => {
      dibujarMarcador(
        `corr-${corr.id}`,
        corr,
        corr.color,
        corr.titulo || 'Corrección',
        corr.descripcion,
        'correccion',
        corr.id
      );
    });

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
        </div>
      </Card.Header>

      <Card.Body>
        <div className="pdf-controls">
          <ButtonGroup>
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
          </ButtonGroup>
          <ButtonGroup className="ms-3">
            <Button 
              variant="secondary" 
              onClick={() => setEscala(s => Math.max(0.5, s - 0.25))}
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
          </ButtonGroup>
        </div>

        <div 
          ref={pageRef}
          style={{ 
            position: 'relative', 
            display: 'inline-block'
          }}
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
              onLoadSuccess={onPageLoadSuccess}
              canvasRef={canvasRef}
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
            {renderizarAnotaciones()}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default VisualizadorDocumento;