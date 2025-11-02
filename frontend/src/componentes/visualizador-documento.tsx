import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { cn } from '../lib/utilidades';
import { type Observacion, type Correccion } from '../tipos/usuario';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface VisualizadorDocumentoProps {
  url_documento: string;
  observaciones: Observacion[];
  correcciones: Correccion[];
  observacion_seleccionada?: number | null;
  correccion_seleccionada?: number | null;
}

const VisualizadorDocumento = ({
  url_documento,
  observaciones,
  correcciones,
  observacion_seleccionada,
  correccion_seleccionada,
}: VisualizadorDocumentoProps) => {
  const [num_paginas, setNumPaginas] = useState<number | null>(null);
  const [pagina_actual, setPaginaActual] = useState(1);
  const [escala, setEscala] = useState(1.5);
  const [dimensiones_pagina, setDimensionesPagina] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [anotacion_hover, setAnotacionHover] = useState<string | null>(null);

  const page_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (observacion_seleccionada) {
      const obs = observaciones.find((o) => o.id === observacion_seleccionada);
      if (obs && obs.pagina_inicio !== pagina_actual) {
        setPaginaActual(obs.pagina_inicio);
      }
    }
  }, [observacion_seleccionada, observaciones, pagina_actual]);

  useEffect(() => {
    if (correccion_seleccionada) {
      const corr = correcciones.find((c) => c.id === correccion_seleccionada);
      if (corr && (corr as any).pagina_inicio !== pagina_actual) {
        setPaginaActual((corr as any).pagina_inicio);
      }
    }
  }, [correccion_seleccionada, correcciones, pagina_actual]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPaginas(numPages);
  };

  const onPageLoadSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setDimensionesPagina({
      width: viewport.width,
      height: viewport.height,
    });
  };

  const cambiarPagina = (delta: number) => {
    setPaginaActual((prev) => Math.max(1, Math.min(num_paginas || 1, prev + delta)));
  };

  const cambiarZoom = (delta: number) => {
    setEscala((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const renderizarAnotacion = (
    id: string,
    tipo: 'observacion' | 'correccion',
    x_inicio: number,
    y_inicio: number,
    x_fin: number,
    y_fin: number,
    color: string,
    titulo: string,
    esta_seleccionada: boolean
  ) => {
    if (!dimensiones_pagina || !page_ref.current) return null;

    const page_rect = page_ref.current.querySelector('.react-pdf__Page__canvas')?.getBoundingClientRect();
    if (!page_rect) return null;

    const x1 = (x_inicio / 100) * page_rect.width;
    const y1 = (y_inicio / 100) * page_rect.height;
    const x2 = (x_fin / 100) * page_rect.width;
    const y2 = (y_fin / 100) * page_rect.height;

    const ancho = Math.abs(x2 - x1);
    const alto = Math.abs(y2 - y1);
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);

    const es_hover = anotacion_hover === id;

    return (
      <TooltipProvider key={id} delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'absolute border-2 transition-all cursor-pointer',
                esta_seleccionada && 'ring-4 ring-offset-2 ring-primary z-20',
                es_hover && 'scale-105 shadow-lg z-10'
              )}
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${ancho}px`,
                height: `${alto}px`,
                borderColor: color,
                backgroundColor: `${color}30`,
              }}
              onMouseEnter={() => setAnotacionHover(id)}
              onMouseLeave={() => setAnotacionHover(null)}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">
              {tipo === 'observacion' ? 'Observación' : 'Corrección'}
            </p>
            <p className="text-sm">{titulo}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderizarAnotaciones = () => {
    const elementos: React.ReactNode[] = [];

    observaciones
      .filter((obs) => obs.pagina_inicio === pagina_actual)
      .forEach((obs) => {
        elementos.push(
          renderizarAnotacion(
            `obs-${obs.id}`,
            'observacion',
            obs.x_inicio,
            obs.y_inicio,
            obs.x_fin,
            obs.y_fin,
            obs.color || '#FFD700',
            obs.titulo,
            observacion_seleccionada === obs.id
          )
        );
      });

    correcciones
      .filter((corr) => (corr as any).pagina_inicio === pagina_actual)
      .forEach((corr) => {
        elementos.push(
          renderizarAnotacion(
            `corr-${corr.id}`,
            'correccion',
            (corr as any).x_inicio,
            (corr as any).y_inicio,
            (corr as any).x_fin,
            (corr as any).y_fin,
            (corr as any).color || '#28a745',
            (corr as any).titulo || 'Corrección',
            correccion_seleccionada === corr.id
          )
        );
      });

    return elementos;
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b p-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Página {pagina_actual} / {num_paginas || '...'}
          </Badge>
          <Badge variant="outline">Zoom: {Math.round(escala * 100)}%</Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => cambiarPagina(-1)}
            disabled={pagina_actual === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => cambiarPagina(1)}
            disabled={pagina_actual === num_paginas}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => cambiarZoom(-0.2)}
            disabled={escala <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => cambiarZoom(0.2)}
            disabled={escala >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEscala(1.5)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 h-[calc(100vh-12rem)] bg-muted/30">
        <div className="flex justify-center p-4 min-h-full">
          <div ref={page_ref} className="relative inline-block shadow-2xl">
            <Document
              file={url_documento}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center min-h-[600px] w-full"
                     style={{ width: `${595 * escala}px`, height: `${842 * escala}px` }}>
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Cargando documento...
                    </span>
                  </div>
                </div>
              }
              error={
                <div className="flex items-center justify-center min-h-[600px] text-destructive-foreground bg-destructive/80 p-4 rounded-lg"
                     style={{ width: `${595 * escala}px`, height: `${842 * escala}px` }}>
                  Error al cargar el documento PDF.
                </div>
              }
            >
              <Page
                pageNumber={pagina_actual}
                scale={escala}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onLoadSuccess={onPageLoadSuccess}
                className="shadow-md"
              />
            </Document>
            <div className="absolute inset-0 pointer-events-none" style={{ width: page_ref.current?.querySelector('.react-pdf__Page__canvas')?.clientWidth, height: page_ref.current?.querySelector('.react-pdf__Page__canvas')?.clientHeight }}>
              {dimensiones_pagina && renderizarAnotaciones()}
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};

export default VisualizadorDocumento;