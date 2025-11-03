import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { ArrowLeft, ArrowRight, Plus, Minus, Save, Loader2 } from 'lucide-react';
import { observacionesApi, proyectosApi, api } from '../servicios/api';
import { type Proyecto, type Documento, Rol } from '../tipos/usuario';
import { toast } from 'sonner';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import BarraLateral from '../componentes/BarraLateral';
import BarraLateralAdmin from '../componentes/BarraLateralAdmin';
import { cn } from '../lib/utilidades';
import { useAutenticacion } from '../contextos/autenticacion-contexto';
import { Card, CardContent, CardHeader, CardTitle } from '../componentes/ui/card';
import { Button } from '../componentes/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../componentes/ui/alert';
import { Badge } from '../componentes/ui/badge';
import { Label } from '../componentes/ui/label';
import { Textarea } from '../componentes/ui/textarea';
import { Input } from '../componentes/ui/input';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Punto {
  x: number;
  y: number;
  pagina: number;
}

const CrearObservacion = () => {
  const { proyectoId } = useParams<{ proyectoId: string }>();
  const navigate = useNavigate();
  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);

  const [proyecto, set_proyecto] = useState<Proyecto | null>(null);
  const [documento_seleccionado, set_documento_seleccionado] = useState<Documento | null>(null);
  const [num_paginas, set_num_paginas] = useState<number | null>(null);
  const [pagina_actual, set_pagina_actual] = useState(1);
  const [escala, set_escala] = useState(1.5);
  const [dimensiones_pagina, set_dimensiones_pagina] = useState<{ width: number; height: number } | null>(null);

  const [punto_inicio, set_punto_inicio] = useState<Punto | null>(null);
  const [punto_fin, set_punto_fin] = useState<Punto | null>(null);
  const [titulo, set_titulo] = useState('');
  const [contenido, set_contenido] = useState('');
  const [color, set_color] = useState('#FFD700');

  const [error, set_error] = useState('');
  const [cargando, set_cargando] = useState(true);
  const [guardando, set_guardando] = useState(false);

  const page_ref = useRef<HTMLDivElement>(null);

  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    if (proyectoId) {
      cargarProyecto();
    }
  }, [proyectoId]);

  const cargarProyecto = async () => {
    try {
      const data = await proyectosApi.obtenerUno(parseInt(proyectoId!));
      set_proyecto(data);

      const documentos = data.documentos?.sort((a: Documento, b: Documento) => b.version - a.version) || [];
      if (documentos.length > 0) {
        set_documento_seleccionado(documentos[0]);
      }
    } catch (err) {
      set_error('Error al cargar el proyecto');
    } finally {
      set_cargando(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    set_num_paginas(numPages);
  };

  const onPageLoadSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    set_dimensiones_pagina({
      width: viewport.width,
      height: viewport.height
    });
  };

  const manejarClickPagina = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dimensiones_pagina) return;

    const contenedor = page_ref.current?.querySelector('.react-pdf__Page__canvas');
    if (!contenedor) return;

    const rect = contenedor.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const pagina = pagina_actual;

    if (!punto_inicio) {
      set_punto_inicio({ x, y, pagina });
    } else {
      set_punto_fin({ x, y, pagina });
    }
  };

  const manejarGuardar = async () => {
    if (!punto_inicio || !punto_fin || !titulo || !contenido || !documento_seleccionado) {
      set_error('Todos los campos son obligatorios y debe marcar dos puntos en el documento.');
      return;
    }

    set_guardando(true);
    set_error('');

    try {
      await observacionesApi.crear(documento_seleccionado.id, {
        titulo,
        contenido,
        x_inicio: punto_inicio.x,
        y_inicio: punto_inicio.y,
        pagina_inicio: punto_inicio.pagina,
        x_fin: punto_fin.x,
        y_fin: punto_fin.y,
        pagina_fin: punto_fin.pagina,
        color
      });

      toast.success('Observación creada exitosamente');
      navigate(`/panel/proyecto/${proyectoId}`);
    } catch (err: any) {
      set_error(err.response?.data?.message || 'Error al crear la observación');
      toast.error('Error al crear la observación');
    } finally {
      set_guardando(false);
    }
  };

  const limpiarMarcadores = () => {
    set_punto_inicio(null);
    set_punto_fin(null);
  };

  const renderizarMarcadores = () => {
    if (!page_ref.current || !dimensiones_pagina) return null;

    const contenedor = page_ref.current.querySelector('.react-pdf__Page__canvas');
    if (!contenedor) return null;

    const rect = contenedor.getBoundingClientRect();
    const elementos: React.ReactElement[] = [];

    if (punto_inicio && punto_inicio.pagina === pagina_actual) {
      const x = (punto_inicio.x / 100) * rect.width;
      const y = (punto_inicio.y / 100) * rect.height;

      elementos.push(
        <div
          key="start-marker"
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg z-[100]"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            backgroundColor: color,
            transform: 'translate(-50%, -50%)',
          }}
        />
      );
    }

    if (punto_fin && punto_fin.pagina === pagina_actual) {
      const x = (punto_fin.x / 100) * rect.width;
      const y = (punto_fin.y / 100) * rect.height;

      elementos.push(
        <div
          key="end-marker"
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg z-[100]"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            backgroundColor: color,
            transform: 'translate(-50%, -50%)',
          }}
        />
      );
    }

    return elementos;
  };

  let contenido_pagina;

  if (cargando) {
    contenido_pagina = (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  } else if (!proyecto || !documento_seleccionado) {
    contenido_pagina = (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No se pudo cargar el proyecto o no tiene documentos
        </AlertDescription>
      </Alert>
    );
  } else {
    contenido_pagina = (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">
                    Página {pagina_actual} de {num_paginas || '...'}
                  </Badge>
                  <Badge variant="outline">
                    Zoom: {Math.round(escala * 100)}%
                  </Badge>
                  {punto_inicio && <Badge variant="default">Punto inicio marcado</Badge>}
                  {punto_fin && <Badge variant="default">Punto fin marcado</Badge>}
                </div>
                <Button variant="outline" size="sm" onClick={limpiarMarcadores}>
                  Limpiar Marcadores
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => set_pagina_actual(p => Math.max(1, p - 1))}
                  disabled={pagina_actual <= 1}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button variant="secondary" disabled>
                  {pagina_actual} / {num_paginas}
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => set_pagina_actual(p => Math.min(num_paginas!, p + 1))}
                  disabled={pagina_actual >= (num_paginas || 1)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => set_escala(s => Math.max(0.5, s - 0.25))}
                  className="ml-auto"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button variant="secondary" disabled>
                  {Math.round(escala * 100)}%
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => set_escala(s => Math.min(3, s + 0.25))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div
                ref={page_ref}
                className="relative inline-block cursor-crosshair"
                onClick={manejarClickPagina}
              >
                <Document
                  file={`${api.defaults.baseURL}/documentos/${documento_seleccionado.id}/archivo`}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex justify-center items-center h-96">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  }
                >
                  <Page
                    pageNumber={pagina_actual}
                    scale={escala}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    onLoadSuccess={onPageLoadSuccess}
                  />
                </Document>
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  {renderizarMarcadores()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la Observación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  type="text"
                  value={titulo}
                  onChange={(e) => set_titulo(e.target.value)}
                  placeholder="Ej: Error de redacción"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contenido">Contenido</Label>
                <Textarea
                  id="contenido"
                  rows={5}
                  value={contenido}
                  onChange={(e) => set_contenido(e.target.value)}
                  placeholder="Describa la observación..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => set_color(e.target.value)}
                  className="w-full"
                />
              </div>

              <Alert>
                <AlertTitle>Instrucciones</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Haga clic en el documento para marcar el punto de inicio</li>
                    <li>Haga clic nuevamente para marcar el punto final</li>
                    <li>Complete el formulario y guarde</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={manejarGuardar}
                  disabled={guardando || !punto_inicio || !punto_fin || !titulo || !contenido}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {guardando ? 'Guardando...' : 'Guardar Observación'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/panel/proyecto/${proyectoId}`)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {es_admin ? (
        <BarraLateralAdmin isOpen={sidebar_open} />
      ) : (
        <BarraLateral isOpen={sidebar_open} />
      )}

      <main
        className={cn(
          'transition-all duration-300 ',
          sidebar_open ? 'ml-64' : 'ml-0'
        )}
      >
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/panel/proyecto/${proyectoId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Crear Observación</h1>
          </div>
          {contenido_pagina}
        </div>
      </main>
    </div>
  );
};

export default CrearObservacion;