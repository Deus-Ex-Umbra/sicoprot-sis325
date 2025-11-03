import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileUp, Plus, Loader2, Info, FileText, Users, Shield } from 'lucide-react';
import VisualizadorDocumento from '../componentes/visualizador-documento';
import { proyectosApi, documentosApi, observacionesApi, correccionesApi, asesoresApi, api } from '../servicios/api';
import { useAutenticacion } from '../contextos/autenticacion-contexto';
import { type Proyecto, type Documento, type Observacion, type Correccion, Rol, EtapaProyecto, type Asesor } from '../tipos/usuario';
import BarraLateral from '../componentes/barra-lateral';
import BarraLateralAdmin from '../componentes/barra-lateral-admin';
import { cn } from '../lib/utilidades';
import { Button } from '../componentes/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../componentes/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../componentes/ui/alert';
import { Input } from '../componentes/ui/input';
import { Label } from '../componentes/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../componentes/ui/tabs';
import { Badge } from '../componentes/ui/badge';
import { PestanaPropuestas } from '../componentes/proyecto/pestania-propuesta';
import { PestanaReuniones } from '../componentes/proyecto/pestania-reuniones';
import { PestanaDefensa } from '../componentes/proyecto/pestania-defensa';
import { PestanaAcciones } from '../componentes/proyecto/pestania-acciones';

const DetalleProyecto = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);

  const [proyecto, set_proyecto] = useState<Proyecto | null>(null);
  const [documentos, set_documentos] = useState<Documento[]>([]);
  const [documento_seleccionado, set_documento_seleccionado] = useState<Documento | null>(null);
  const [observaciones, set_observaciones] = useState<Observacion[]>([]);
  const [correcciones, set_correcciones] = useState<Correccion[]>([]);
  const [asesores, set_asesores] = useState<Asesor[]>([]);
  
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  const [archivo, set_archivo] = useState<File | null>(null);
  const [subiendo_archivo, set_subiendo_archivo] = useState(false);
  const [observacion_seleccionada, set_observacion_seleccionada] = useState<number | null>(null);
  const [correccion_seleccionada, set_correccion_seleccionada] = useState<number | null>(null);

  const es_estudiante = usuario?.rol === Rol.Estudiante;
  const es_asesor = usuario?.rol === Rol.Asesor;
  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id]);

  const cargarDatos = async () => {
    try {
      set_cargando(true);
      const proyecto_data = await proyectosApi.obtenerUno(parseInt(id!));
      set_proyecto(proyecto_data);

      const documentos_data = proyecto_data.documentos?.sort((a: Documento, b: Documento) => b.version - a.version) || [];
      set_documentos(documentos_data);

      if (documentos_data.length > 0) {
        set_documento_seleccionado(documentos_data[0]);
      } else {
        set_documento_seleccionado(null);
      }

      const [obs_data, corr_data, asesores_data] = await Promise.all([
        observacionesApi.obtenerObservacionesPorProyecto(parseInt(id!)),
        correccionesApi.obtenerPorProyecto(parseInt(id!)),
        es_admin ? asesoresApi.obtenerTodos() : Promise.resolve([]),
      ]);
      set_observaciones(obs_data);
      set_correcciones(corr_data);
      set_asesores(asesores_data as Asesor[]);
      
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      set_error('Error al cargar el proyecto');
    } finally {
      set_cargando(false);
    }
  };

  const manejarSubidaArchivo = async () => {
    if (!archivo || !proyecto) return;

    set_subiendo_archivo(true);
    set_error('');

    try {
      const form_data = new FormData();
      form_data.append('archivo', archivo);

      await documentosApi.subirDocumento(proyecto.id, form_data);

      await cargarDatos();
      set_archivo(null);
    } catch (err: any) {
      set_error(err.response?.data?.message || 'Error al subir el documento');
    } finally {
      set_subiendo_archivo(false);
    }
  };

  const observaciones_del_documento = documento_seleccionado
    ? observaciones.filter(obs => (obs as any).documento.id === documento_seleccionado.id)
    : [];

  const correcciones_del_documento = documento_seleccionado
    ? correcciones.filter(corr => (corr as any).documento.id === documento_seleccionado.id)
    : [];

  const observaciones_pendientes_etapa_actual = observaciones.filter(obs =>
    obs.etapa_observada === proyecto?.etapa_actual &&
    (obs.estado === 'pendiente' || obs.estado === 'en_revision' || obs.estado === 'rechazado')
  ).length;

  const getPestanaPorDefecto = () => {
    if (proyecto?.etapa_actual === EtapaProyecto.PROPUESTA) return 'propuestas';
    if (proyecto?.etapa_actual === EtapaProyecto.PROYECTO) return 'reuniones';
    if (proyecto?.etapa_actual === EtapaProyecto.LISTO_DEFENSA || proyecto?.etapa_actual === EtapaProyecto.SOLICITUD_DEFENSA || proyecto?.etapa_actual === EtapaProyecto.TERMINADO) return 'defensa';
    return 'visor';
  };

  let contenido_pagina;

  if (cargando) {
    contenido_pagina = (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  } else if (!proyecto) {
    contenido_pagina = (
      <Alert variant="destructive">
        <AlertTitle>Proyecto no encontrado</AlertTitle>
        <AlertDescription>
          <Button variant="link" onClick={() => navigate('/panel/proyectos')}>
            Volver a proyectos
          </Button>
        </AlertDescription>
      </Alert>
    );
  } else {
    contenido_pagina = (
      <Tabs defaultValue={getPestanaPorDefecto()} className="w-full">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/panel/proyectos')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{proyecto.titulo}</h1>
              <p className="text-muted-foreground">Etapa actual: <Badge>{proyecto.etapa_actual}</Badge></p>
            </div>
          </div>
          <TabsList>
            <TabsTrigger value="visor"><FileText className="h-4 w-4 mr-2" />Visor de Documentos</TabsTrigger>
            <TabsTrigger value="propuestas"><Info className="h-4 w-4 mr-2" />Propuestas</TabsTrigger>
            <TabsTrigger value="reuniones"><Users className="h-4 w-4 mr-2" />Reuniones</TabsTrigger>
            <TabsTrigger value="defensa"><Shield className="h-4 w-4 mr-2" />Defensa</TabsTrigger>
          </TabsList>
        </div>

        {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
        
        <TabsContent value="visor">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {es_estudiante && (
                    <div className="space-y-2">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        Seleccionar Archivo PDF
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".pdf"
                        onChange={(e: any) => set_archivo(e.target.files[0])}
                        disabled={subiendo_archivo}
                      />
                      {archivo && <p className="text-sm text-muted-foreground">{archivo.name}</p>}
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={manejarSubidaArchivo}
                        disabled={!archivo || subiendo_archivo}
                      >
                        {subiendo_archivo ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FileUp className="mr-2 h-4 w-4" />
                        )}
                        {subiendo_archivo ? 'Subiendo...' : 'Subir Documento'}
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {documentos.map((doc) => (
                      <div
                        key={doc.id}
                        className={cn(
                          'p-3 rounded-md border cursor-pointer transition-colors',
                          documento_seleccionado?.id === doc.id
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-accent'
                        )}
                        onClick={() => {
                          set_documento_seleccionado(doc);
                          set_observacion_seleccionada(null);
                          set_correccion_seleccionada(null);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Versión {doc.version}</span>
                        </div>
                        <small className="text-muted-foreground">
                          {new Date(doc.fecha_subida).toLocaleDateString()}
                        </small>
                      </div>
                    ))}
                  </div>

                  {documentos.length === 0 && (
                    <p className="text-muted-foreground text-center pt-4">
                      No hay documentos cargados
                    </p>
                  )}
                </CardContent>
              </Card>

              {es_asesor && (
                <PestanaAcciones
                  proyecto={proyecto}
                  observaciones_pendientes={observaciones_pendientes_etapa_actual}
                  onActualizarProyecto={cargarDatos}
                />
              )}
            </div>

            <div className="lg:col-span-3">
              {documento_seleccionado ? (
                <VisualizadorDocumento
                  key={documento_seleccionado.id}
                  url_documento={`${api.defaults.baseURL}/documentos/${documento_seleccionado.id}/archivo`}
                  observaciones={observaciones_del_documento}
                  correcciones={correcciones_del_documento}
                  observacion_seleccionada={observacion_seleccionada}
                  correccion_seleccionada={correccion_seleccionada}
                />
              ) : (
                <Card className="h-[80vh]">
                  <CardContent className="flex justify-center items-center h-full">
                    <p className="text-muted-foreground">
                      {documentos.length === 0
                        ? 'No hay documentos cargados en este proyecto.'
                        : 'Seleccione un documento para visualizar.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="propuestas">
          <PestanaPropuestas proyecto={proyecto} onActualizarProyecto={cargarDatos} />
        </TabsContent>

        <TabsContent value="reuniones">
          <PestanaReuniones proyecto={proyecto} onActualizarProyecto={cargarDatos} />
        </TabsContent>

        <TabsContent value="defensa">
          <PestanaDefensa proyecto={proyecto} asesores={asesores} onActualizarProyecto={cargarDatos} />
        </TabsContent>
      </Tabs>
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
          {contenido_pagina}
        </div>
      </main>
    </div>
  );
};

export default DetalleProyecto;