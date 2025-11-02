import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
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
  urlDocumento: string;
  observaciones: Observacion[];
  correcciones: Correccion[];
  observacionSeleccionada?: number | null;
  correccionSeleccionada?: number | null;
}

const VisualizadorDocumento = ({
  urlDocumento,
  observaciones,
  correcciones,
  observacionSeleccionada,
  correccionSeleccionada,
}: VisualizadorDocumentoProps) => {
  const [num_paginas, set_num_paginas] = useState<number | null>(null);
  const [pagina_actual, set_pagina_actual] = useState(1);
  const [escala, set_escala] = useState(1.5);
  const [dimensiones_pagina, set_dimensiones_pagina] = useState<{ width: number; height: number } | null>(null);
  const [anotacion_hover, set_anotacion_hover] = useState<string | null>(null);

  const page_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (observacionSeleccionada) {
      const obs = observaciones.find((o) => o.id === observacionSeleccionada);
      if (obs && obs.pagina_inicio !== pagina_actual) {
        set_pagina_actual(obs.pagina_inicio);
      }
    }
  }, [observacionSeleccionada, observaciones]);

  useEffect(() => {
    if (correccionSeleccionada) {
      const corr = correcciones.find((c) => c.id === correccionSeleccionada);
      if (corr && (corr as any).pagina_inicio !== pagina_actual) {
        set_pagina_actual((corr as any).pagina_inicio);
      }
    }
  }, [correccionSeleccionada, correcciones]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    set_num_paginas(numPages);
  };

  const onPageLoadSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    set_dimensiones_pagina({
      width: viewport.width,
      height: viewport.height,
    });
  };

  const cambiar_pagina = (delta: number) => {
    set_pagina_actual((prev) => Math.max(1, Math.min(num_paginas || 1, prev + delta)));
  };

  const cambiar_zoom = (delta: number) => {
    set_escala((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const renderizar_anotacion = (
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
    if (!dimensiones_pagina) return null;

    const x1 = (x_inicio / 100) * dimensiones_pagina.width * escala;
    const y1 = (y_inicio / 100) * dimensiones_pagina.height * escala;
    const x2 = (x_fin / 100) * dimensiones_pagina.width * escala;
    const y2 = (y_fin / 100) * dimensiones_pagina.height * escala;

    const ancho = Math.abs(x2 - x1);
    const alto = Math.abs(y2 - y1);
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);

    const es_hover = anotacion_hover === id;

    return (
      <TooltipProvider key={id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'absolute border-2 transition-all cursor-pointer',
                esta_seleccionada && 'ring-2 ring-offset-2 ring-primary',
                es_hover && 'scale-105 shadow-lg'
              )}
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${ancho}px`,
                height: `${alto}px`,
                borderColor: color,
                backgroundColor: `${color}20`,
              }}
              onMouseEnter={() => set_anotacion_hover(id)}
              onMouseLeave={() => set_anotacion_hover(null)}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">{tipo === 'observacion' ? 'Observación' : 'Corrección'}</p>
            <p className="text-sm">{titulo}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderizar_anotaciones = () => {
    const elementos: React.ReactNode[] = [];

    observaciones
      .filter((obs) => obs.pagina_inicio === pagina_actual)
      .forEach((obs) => {
        elementos.push(
          renderizar_anotacion(
            `obs-${obs.id}`,
            'observacion',
            obs.x_inicio,
            obs.y_inicio,
            obs.x_fin,
            obs.y_fin,
            '#FFD700',
            obs.titulo,
            observacionSeleccionada === obs.id
          )
        );
      });

    correcciones
      .filter((corr) => (corr as any).pagina_inicio === pagina_actual)
      .forEach((corr) => {
        elementos.push(
          renderizar_anotacion(
            `corr-${corr.id}`,
            'correccion',
            (corr as any).x_inicio,
            (corr as any).y_inicio,
            (corr as any).x_fin,
            (corr as any).y_fin,
            '#28a745',
            (corr as any).titulo || 'Corrección',
            correccionSeleccionada === corr.id
          )
        );
      });

    return elementos;
  };

  return (
    <Card className="h-full">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-2 border-b p-3">
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
              onClick={() => cambiar_pagina(-1)}
              disabled={pagina_actual === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => cambiar_pagina(1)}
              disabled={pagina_actual === num_paginas}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => cambiar_zoom(-0.2)}
              disabled={escala <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => cambiar_zoom(0.2)}
              disabled={escala >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => set_escala(1.5)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="flex justify-center p-4 bg-muted/30">
            <div ref={page_ref} className="relative inline-block shadow-2xl">
              <Document
                file={urlDocumento}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center min-h-[600px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                  </div>
                }
                error={
                  <div className="flex items-center justify-center min-h-[600px] text-destructive">
                    Error al cargar el documento
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
              <div className="absolute inset-0 pointer-events-none">
                {renderizar_anotaciones()}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default VisualizadorDocumento;