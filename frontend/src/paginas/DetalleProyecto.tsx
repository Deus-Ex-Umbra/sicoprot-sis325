import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileUp, Plus, Loader2, Info, FileText, Users, Shield, MessageSquare, CheckCircle, Wrench } from 'lucide-react';
import VisualizadorDocumento from '../componentes/visualizador-documento';
import { proyectosApi, documentosApi, observacionesApi, correccionesApi, asesoresApi, api } from '../servicios/api';
import { useAutenticacion } from '../contextos/autenticacion-contexto';
import { type Proyecto, type Documento, type Observacion, type Correccion, Rol, EtapaProyecto, type Usuario, TipoGrupo } from '../tipos/usuario';
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
import { PestanaReuniones } from '../componentes/proyecto/pestania-reuniones';
import { PestanaDefensa } from '../componentes/proyecto/pestania-defensa';
import { PestanaAcciones } from '../componentes/proyecto/pestania-acciones';
import { toast } from 'sonner';

const DetalleProyecto = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario, actualizarUsuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);

  const [proyecto, set_proyecto] = useState<Proyecto | null>(null);
  const [documentos, set_documentos] = useState<Documento[]>([]);
  const [documento_seleccionado, set_documento_seleccionado] = useState<Documento | null>(null);
  const [observaciones, set_observaciones] = useState<Observacion[]>([]);
  const [correcciones, set_correcciones] = useState<Correccion[]>([]);
  const [asesores, set_asesores] = useState<Usuario[]>([]);
  
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

  const cargarDatos = async (mostrar_toast = false) => {
    try {
      set_cargando(true);
      const proyecto_data = await proyectosApi.obtenerUno(parseInt(id!));
      set_proyecto(proyecto_data);

      const documentos_data = proyecto_data.documentos
        ?.filter((doc: Documento) => doc.ruta_archivo !== proyecto_data.ruta_memorial)
        .sort((a: Documento, b: Documento) => b.version - a.version) || [];
        
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
      set_asesores(asesores_data as Usuario[]);

      if (mostrar_toast) {
        if (proyecto_data.etapa_actual === EtapaProyecto.PROYECTO) {
            toast.success('Perfil Aprobado', { description: 'Fuiste desinscrito de tu grupo de Taller I. Ahora debes inscribirte a un grupo de Taller II.' });
            actualizarUsuario({ perfil: { grupo: null } });
            navigate('/panel/inscripcion-grupos');
        }
        if (proyecto_data.etapa_actual === EtapaProyecto.LISTO_DEFENSA) {
            toast.success('Proyecto Aprobado', { description: 'Tu asesor marcó tu proyecto como listo. Ya puedes solicitar tu defensa.' });
            actualizarUsuario({ perfil: { grupo: null } });
        }
      }
      
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      set_error('Error al cargar el proyecto');
    } finally {
      set_cargando(false);
    }
  };
  
  const onActualizarProyecto = () => {
    cargarDatos(true);
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

  const getPestanaPorDefecto = () => {
    if (!proyecto) return 'propuesta-info';

    switch (proyecto.etapa_actual) {
      case EtapaProyecto.PROPUESTA:
        return 'propuesta-info';
      case EtapaProyecto.PERFIL:
        return 'visor';
      case EtapaProyecto.PROYECTO:
        return 'reuniones';
      case EtapaProyecto.LISTO_DEFENSA:
      case EtapaProyecto.SOLICITUD_DEFENSA:
      case EtapaProyecto.TERMINADO:
        return 'defensa';
      default:
        return 'propuesta-info';
    }
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

    const etapa_actual = proyecto.etapa_actual;
    
    const es_taller_1 = etapa_actual === EtapaProyecto.PROPUESTA || etapa_actual === EtapaProyecto.PERFIL;
    
    const es_taller_2_o_superior = etapa_actual === EtapaProyecto.PROYECTO || 
                                     etapa_actual === EtapaProyecto.LISTO_DEFENSA || 
                                     etapa_actual === EtapaProyecto.SOLICITUD_DEFENSA || 
                                     etapa_actual === EtapaProyecto.TERMINADO;

    const mostrar_pestana_visor = etapa_actual !== EtapaProyecto.PROPUESTA;
    const mostrar_pestana_reuniones = es_taller_2_o_superior;
    const mostrar_pestana_defensa = es_taller_2_o_superior;

    const puede_subir_documento = es_estudiante && etapa_actual === EtapaProyecto.PERFIL;
    
    const documentos_para_mostrar = (es_taller_2_o_superior || etapa_actual === EtapaProyecto.PERFIL)
      ? documentos
      : [];

    const observaciones_del_documento = documento_seleccionado
      ? observaciones.filter(obs => obs.documento && obs.documento.id === documento_seleccionado.id)
      : [];
      
    const observaciones_del_proyecto = observaciones.filter(obs => !obs.documento);

    const correcciones_del_documento = documento_seleccionado
      ? correcciones.filter(corr => (corr as any).documento?.id === documento_seleccionado.id)
      : [];

    const observaciones_pendientes = observaciones.filter(obs =>
      (obs.estado === 'pendiente' || obs.estado === 'rechazado')
    ).length;

    const observaciones_pendientes_etapa_actual = observaciones.filter(obs =>
      obs.etapa_observada === proyecto?.etapa_actual &&
      (obs.estado === 'pendiente' || obs.estado === 'en_revision' || obs.estado === 'rechazado')
    ).length;

    const comentario_propuesta = (proyecto as any).comentario_aprobacion_propuesta;
    const comentario_perfil = (proyecto as any).comentario_aprobacion_perfil;
    
    const estudiante_principal = proyecto.estudiantes?.[0];
    const grupo_activo_estudiante = estudiante_principal?.grupos?.find(g => g.periodo?.activo);
    const tipo_grupo_actual = grupo_activo_estudiante?.tipo || null;

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
              <div className="text-muted-foreground">Etapa actual: <Badge>{proyecto.etapa_actual}</Badge></div>
            </div>
          </div>
          <TabsList>
            <TabsTrigger value="propuesta-info"><Info className="h-4 w-4 mr-2" />Propuesta</TabsTrigger>
            {mostrar_pestana_visor && <TabsTrigger value="visor"><FileText className="h-4 w-4 mr-2" />Visor (Perfil)</TabsTrigger>}
            {mostrar_pestana_reuniones && <TabsTrigger value="reuniones"><Users className="h-4 w-4 mr-2" />Reuniones y Obs. (Taller II)</TabsTrigger>}
            {mostrar_pestana_defensa && <TabsTrigger value="defensa"><Shield className="h-4 w-4 mr-2" />Defensa</TabsTrigger>}
          </TabsList>
        </div>

        {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
        
        <TabsContent value="propuesta-info">
          <Card>
            <CardHeader>
              <CardTitle>Descripción de la Propuesta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {comentario_propuesta && (
                <Alert variant={proyecto.propuesta_aprobada ? 'default' : 'destructive'}>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Comentarios del Asesor sobre la Propuesta</AlertTitle>
                  <AlertDescription
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: comentario_propuesta }}
                  />
                </Alert>
              )}
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: proyecto.cuerpo_html || '<p><em>No se proporcionó descripción.</em></p>' }} 
              />
              {es_asesor && (
                <PestanaAcciones
                  proyecto={proyecto}
                  observaciones_pendientes={observaciones_pendientes_etapa_actual}
                  tipo_grupo_actual={tipo_grupo_actual}
                  onActualizarProyecto={onActualizarProyecto}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visor">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos (Perfil)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {puede_subir_documento && (
                    <div className="space-y-2">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        Seleccionar Archivo PDF (Perfil)
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
                  
                  {es_estudiante && es_taller_2_o_superior && (
                     <Alert>
                        <AlertTitle>Etapa de Proyecto (Taller II)</AlertTitle>
                        <AlertDescription>
                          Ya no se suben nuevas versiones. Este es el perfil aprobado para consulta.
                        </AlertDescription>
                      </Alert>
                  )}

                  <div className="space-y-2">
                    {documentos_para_mostrar.map((doc) => (
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

              {comentario_perfil && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Comentarios del Asesor sobre el Perfil</AlertTitle>
                  <AlertDescription
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: comentario_perfil }}
                  />
                </Alert>
              )}

              {es_asesor && documento_seleccionado && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/panel/proyecto/${proyecto.id}/crear-observacion`)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Crear Observación
                </Button>
              )}

              {es_estudiante && observaciones_pendientes > 0 && etapa_actual === EtapaProyecto.PERFIL && (
                 <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/panel/proyecto/${proyecto.id}/crear-correccion`)}
                >
                  <Wrench className="mr-2 h-4 w-4" />
                  Registrar Corrección
                </Button>
              )}

              {es_asesor && (
                <PestanaAcciones
                  proyecto={proyecto}
                  observaciones_pendientes={observaciones_pendientes_etapa_actual}
                  tipo_grupo_actual={tipo_grupo_actual}
                  onActualizarProyecto={onActualizarProyecto}
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
        
        <TabsContent value="reuniones">
          <PestanaReuniones 
            proyecto={proyecto} 
            observaciones={observaciones_del_proyecto}
            onActualizarProyecto={onActualizarProyecto} 
          />
        </TabsContent>

        <TabsContent value="defensa">
          <PestanaDefensa proyecto={proyecto} asesores={asesores} onActualizarProyecto={onActualizarProyecto} />
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