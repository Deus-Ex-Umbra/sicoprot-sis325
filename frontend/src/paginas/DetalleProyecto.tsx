import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, FileUp, Plus, Loader2, Info, FileText, Users, Shield, MessageSquare, CheckCircle, Wrench, ArrowRight, Calendar, BookOpen } from 'lucide-react';
import { PestanaCronograma } from '../componentes/proyecto/pestania-cronograma';
import VisualizadorDocumento from '../componentes/visualizador-documento';
import { proyectosApi, documentosApi, observacionesApi, correccionesApi, asesoresApi, api } from '../servicios/api';
import { useAutenticacion } from '../contextos/autenticacion-contexto';
import { type Proyecto, type Documento, type Observacion, type Correccion, Rol, EtapaProyecto, type Usuario, TipoGrupo, TipoDocumento } from '../tipos/usuario';
import BarraLateral from '../componentes/barra-lateral';
import BarraLateralAdmin from '../componentes/barra-lateral-admin';
import { cn } from '../lib/utilidades';
import { Button } from '../componentes/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../componentes/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../componentes/ui/alert';
import { Input } from '../componentes/ui/input';
import { Label } from '../componentes/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../componentes/ui/tabs';
import { Badge } from '../componentes/ui/badge';
import { PestanaReuniones } from '../componentes/proyecto/pestania-reuniones';
import { PestanaDefensa } from '../componentes/proyecto/pestania-defensa';
import { PestanaAcciones } from '../componentes/proyecto/pestania-acciones';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

const DetalleProyecto = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, actualizarUsuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);

  const [proyecto, set_proyecto] = useState<Proyecto | null>(null);
  const [documentos, set_documentos] = useState<Documento[]>([]);
  const [documento_seleccionado, set_documento_seleccionado] = useState<Documento | null>(null);
  const [documento_proyecto_seleccionado, set_documento_proyecto_seleccionado] = useState<Documento | null>(null);
  const [observaciones, set_observaciones] = useState<Observacion[]>([]);
  const [correcciones, set_correcciones] = useState<Correccion[]>([]);
  const [asesores, set_asesores] = useState<Usuario[]>([]);
  
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  const [archivo, set_archivo] = useState<File | null>(null);
  const [archivo_proyecto, set_archivo_proyecto] = useState<File | null>(null);
  const [subiendo_archivo, set_subiendo_archivo] = useState(false);
  const [subiendo_archivo_proyecto, set_subiendo_archivo_proyecto] = useState(false);
  const [observacion_seleccionada, set_observacion_seleccionada] = useState<number | null>(null);
  const [correccion_seleccionada, set_correccion_seleccionada] = useState<number | null>(null);
  const [observacion_proyecto_seleccionada, set_observacion_proyecto_seleccionada] = useState<number | null>(null);
  const [correccion_proyecto_seleccionada, set_correccion_proyecto_seleccionada] = useState<number | null>(null);

  const es_estudiante = usuario?.rol === Rol.Estudiante;
  const es_asesor = usuario?.rol === Rol.Asesor;
  const es_admin = usuario?.rol === Rol.Administrador;
  const es_vista_repositorio = location.state?.from === 'repositorio';

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

      // Filtrar documentos excluyendo el memorial
      const todos_documentos = proyecto_data.documentos
        ?.filter((doc: Documento) => doc.ruta_archivo !== proyecto_data.ruta_memorial)
        .sort((a: Documento, b: Documento) => b.version - a.version) || [];
      
      // Separar documentos de perfil y proyecto
      const docs_perfil = todos_documentos.filter((doc: Documento) => 
        !doc.tipo_documento || doc.tipo_documento === TipoDocumento.PERFIL
      );
      const docs_proyecto = todos_documentos.filter((doc: Documento) => 
        doc.tipo_documento === TipoDocumento.PROYECTO
      );
        
      set_documentos(todos_documentos);

      // Seleccionar el documento más reciente de cada tipo
      if (docs_perfil.length > 0) {
        set_documento_seleccionado(docs_perfil[0]);
      } else {
        set_documento_seleccionado(null);
      }
      
      if (docs_proyecto.length > 0) {
        set_documento_proyecto_seleccionado(docs_proyecto[0]);
      } else {
        set_documento_proyecto_seleccionado(null);
      }

      if (proyecto_data.etapa_actual !== EtapaProyecto.TERMINADO || !es_vista_repositorio) {
        const [obs_data, corr_data, asesores_data] = await Promise.all([
          observacionesApi.obtenerObservacionesPorProyecto(parseInt(id!)),
          correccionesApi.obtenerPorProyecto(parseInt(id!)),
          es_admin ? asesoresApi.obtenerTodos() : Promise.resolve([]),
        ]);
        set_observaciones(obs_data);
        set_correcciones(corr_data);
        set_asesores(asesores_data as Usuario[]);
      }

      if (mostrar_toast) {
        if (proyecto_data.etapa_actual === EtapaProyecto.PROYECTO) {
          if (es_estudiante) {
            toast.success('Perfil Aprobado', { description: 'Fuiste desinscrito de tu grupo de Taller I. Ahora debes inscribirte a un grupo de Taller II.' });
            actualizarUsuario({ perfil: { grupo: null } });
            navigate('/panel/inscripcion-grupos');
          } else if (es_asesor) {
            toast.success('Perfil Aprobado', { description: 'El proyecto ha pasado a Taller de Grado II.' });
          }
        }
        if (proyecto_data.etapa_actual === EtapaProyecto.LISTO_DEFENSA) {
          if (es_estudiante) {
            toast.success('Proyecto Aprobado', { description: 'Tu asesor marcó tu proyecto como listo. Ya puedes solicitar tu defensa.' });
            actualizarUsuario({ perfil: { grupo: null } });
          } else if (es_asesor) {
             toast.success('Proyecto Aprobado', { description: 'El estudiante ha sido notificado y ya puede solicitar su defensa.' });
          }
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

  const onActualizarSimple = () => {
    cargarDatos(false);
  };

  const manejarSubidaArchivo = async () => {
    if (!archivo || !proyecto) return;

    set_subiendo_archivo(true);
    set_error('');

    try {
      const form_data = new FormData();
      form_data.append('archivo', archivo);

      await documentosApi.subirDocumento(proyecto.id, form_data, 'perfil');

      await cargarDatos();
      set_archivo(null);
    } catch (err: any) {
      set_error(err.response?.data?.message || 'Error al subir el documento');
    } finally {
      set_subiendo_archivo(false);
    }
  };

  const manejarSubidaArchivoProyecto = async () => {
    if (!archivo_proyecto || !proyecto) return;

    set_subiendo_archivo_proyecto(true);
    set_error('');

    try {
      const form_data = new FormData();
      form_data.append('archivo', archivo_proyecto);

      await documentosApi.subirDocumento(proyecto.id, form_data, 'proyecto');

      await cargarDatos();
      set_archivo_proyecto(null);
      toast.success('Documento de proyecto subido correctamente');
    } catch (err: any) {
      set_error(err.response?.data?.message || 'Error al subir el documento de proyecto');
    } finally {
      set_subiendo_archivo_proyecto(false);
    }
  };

  const getPestanaPorDefecto = () => {
    if (!proyecto) return 'propuesta-info';
    
    if (proyecto.etapa_actual === EtapaProyecto.TERMINADO) {
      return 'visor';
    }

    switch (proyecto.etapa_actual) {
      case EtapaProyecto.PROPUESTA:
        return 'propuesta-info';
      case EtapaProyecto.PERFIL:
        return 'visor';
      case EtapaProyecto.PROYECTO:
        return 'visor-proyecto';
      case EtapaProyecto.LISTO_DEFENSA:
      case EtapaProyecto.SOLICITUD_DEFENSA:
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
          <Button variant="link" onClick={() => navigate(-1)}>
            Volver
          </Button>
        </AlertDescription>
      </Alert>
    );
  } else {

    const es_proyecto_terminado = proyecto.etapa_actual === EtapaProyecto.TERMINADO;
    const documento_perfil = documentos.length > 0 ? documentos[0] : null;

    if (es_proyecto_terminado) {
      
      if (es_vista_repositorio && documento_perfil) {
        contenido_pagina = (
          <>
            <div className="flex items-center gap-2 mb-6">
              <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{proyecto.titulo}</h1>
                <div className="text-muted-foreground">Etapa actual: <Badge>{proyecto.etapa_actual}</Badge></div>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Documento de Perfil</CardTitle>
                <CardDescription>
                  Este es el documento de perfil final aprobado para este proyecto. La descarga está deshabilitada desde el repositorio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VisualizadorDocumento
                  key={documento_perfil.id}
                  url_documento={documentosApi.obtenerArchivoUrl(documento_perfil.id)}
                  observaciones={[]}
                  correcciones={[]}
                  permitir_descarga={false}
                />
              </CardContent>
            </Card>
          </>
        );
      } else {
        contenido_pagina = (
          <>
            <div className="flex items-center gap-2 mb-6">
              <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{proyecto.titulo}</h1>
                <div className="text-muted-foreground">Etapa actual: <Badge>{proyecto.etapa_actual}</Badge></div>
              </div>
            </div>
            
            <Tabs defaultValue={documento_perfil ? "visor" : "propuesta-info"} className="w-full">
              <TabsList>
                <TabsTrigger value="propuesta-info"><Info className="h-4 w-4 mr-2" />Propuesta</TabsTrigger>
                {documento_perfil && <TabsTrigger value="visor"><FileText className="h-4 w-4 mr-2" />Documento de Perfil</TabsTrigger>}
                {proyecto.ruta_memorial && <TabsTrigger value="defensa"><Shield className="h-4 w-4 mr-2" />Memorial</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="propuesta-info">
                <Card>
                  <CardHeader><CardTitle>Descripción de la Propuesta</CardTitle></CardHeader>
                  <CardContent className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: proyecto.cuerpo_html || '<p><em>No se proporcionó descripción.</em></p>' }} 
                  />
                </Card>
              </TabsContent>
              
              {documento_perfil && (
                <TabsContent value="visor">
                  <VisualizadorDocumento
                    key={documento_perfil.id}
                    url_documento={documentosApi.obtenerArchivoUrl(documento_perfil.id)}
                    observaciones={[]}
                    correcciones={[]}
                    permitir_descarga={true}
                  />
                </TabsContent>
              )}

              {proyecto.ruta_memorial && (
                <TabsContent value="defensa">
                  <Card>
                    <CardHeader>
                      <CardTitle>Memorial de Defensa</CardTitle>
                      <CardDescription>Documento final presentado para la defensa.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <VisualizadorDocumento
                        key="memorial"
                        url_documento={documentosApi.obtenerArchivoPorRutaUrl(proyecto.ruta_memorial)}
                        observaciones={[]}
                        correcciones={[]}
                        permitir_descarga={true}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </>
        );
      }
      
    } else {
      const estudiante_principal = proyecto.estudiantes?.[0];
      const grupo_activo_estudiante = estudiante_principal?.grupos?.find(g => g.periodo?.activo);

      const necesita_grupo_taller_ii = es_estudiante &&
                                        proyecto.perfil_aprobado &&
                                        !grupo_activo_estudiante &&
                                        proyecto.etapa_actual !== EtapaProyecto.TERMINADO;

      if (necesita_grupo_taller_ii) {
        contenido_pagina = (
          <Card>
            <CardHeader>
              <CardTitle>¡Felicidades! Has completado Taller de Grado I</CardTitle>
              <CardDescription>Tu perfil de proyecto ha sido aprobado.</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Acción Requerida</AlertTitle>
                <AlertDescription>
                  <p>Para continuar con la etapa de "Proyecto" (Taller de Grado II), debes inscribirte a un grupo de Taller de Grado II.</p>
                  <Button
                    variant="default"
                    className="mt-4"
                    onClick={() => navigate('/panel/inscripcion-grupos')}
                  >
                    Ir a Inscripción de Grupos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );
      } else {
        const etapa_actual = proyecto.etapa_actual;
        
        const es_taller_1 = etapa_actual === EtapaProyecto.PROPUESTA || etapa_actual === EtapaProyecto.PERFIL;
        
        const es_taller_2_o_superior = etapa_actual === EtapaProyecto.PROYECTO || 
                                        etapa_actual === EtapaProyecto.LISTO_DEFENSA || 
                                        etapa_actual === EtapaProyecto.SOLICITUD_DEFENSA || 
                                        etapa_actual === EtapaProyecto.PRE_DEFENSA ||
                                        etapa_actual === EtapaProyecto.EN_DEFENSA ||
                                        etapa_actual === EtapaProyecto.TERMINADO;

        const mostrar_pestana_visor = etapa_actual !== EtapaProyecto.PROPUESTA;
        const mostrar_pestana_visor_proyecto = es_taller_2_o_superior;
        const mostrar_pestana_reuniones = es_taller_2_o_superior;
        const mostrar_pestana_defensa = es_taller_2_o_superior;
        
        // El cronograma solo se muestra durante etapas de trabajo activo (PROYECTO, LISTO_DEFENSA, SOLICITUD_DEFENSA)
        // NO se muestra en etapas de defensa (PRE_DEFENSA, EN_DEFENSA, TERMINADO, REPROBADO) ni a asesores
        const esta_en_etapa_defensa = etapa_actual === EtapaProyecto.PRE_DEFENSA || 
                                       etapa_actual === EtapaProyecto.EN_DEFENSA || 
                                       etapa_actual === EtapaProyecto.TERMINADO ||
                                       etapa_actual === EtapaProyecto.REPROBADO;
        const mostrar_pestana_cronograma = es_taller_2_o_superior && !es_asesor && !esta_en_etapa_defensa;

        const puede_subir_documento = es_estudiante && etapa_actual === EtapaProyecto.PERFIL;
        const puede_subir_documento_proyecto = es_estudiante && etapa_actual === EtapaProyecto.PROYECTO;
        
        // Separar documentos por tipo
        const documentos_perfil = documentos.filter(doc => 
          !doc.tipo_documento || doc.tipo_documento === TipoDocumento.PERFIL
        );
        const documentos_proyecto = documentos.filter(doc => 
          doc.tipo_documento === TipoDocumento.PROYECTO
        );
        
        const documentos_perfil_para_mostrar = (es_taller_2_o_superior || etapa_actual === EtapaProyecto.PERFIL)
          ? documentos_perfil
          : [];
          
        const documentos_proyecto_para_mostrar = es_taller_2_o_superior
          ? documentos_proyecto
          : [];

        const observaciones_del_documento = documento_seleccionado
          ? observaciones.filter(obs => obs.documento && obs.documento.id === documento_seleccionado.id)
          : [];
          
        const observaciones_del_documento_proyecto = documento_proyecto_seleccionado
          ? observaciones.filter(obs => obs.documento && obs.documento.id === documento_proyecto_seleccionado.id)
          : [];
          
        const observaciones_del_proyecto = observaciones.filter(obs => !obs.documento);

        const correcciones_del_documento = documento_seleccionado
          ? correcciones.filter(corr => (corr as any).documento?.id === documento_seleccionado.id)
          : [];
          
        const correcciones_del_documento_proyecto = documento_proyecto_seleccionado
          ? correcciones.filter(corr => (corr as any).documento?.id === documento_proyecto_seleccionado.id)
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
                {mostrar_pestana_visor && <TabsTrigger value="visor"><FileText className="h-4 w-4 mr-2" />Doc. Perfil</TabsTrigger>}
                {mostrar_pestana_visor_proyecto && <TabsTrigger value="visor-proyecto"><BookOpen className="h-4 w-4 mr-2" />Doc. Proyecto</TabsTrigger>}
                {mostrar_pestana_reuniones && <TabsTrigger value="reuniones"><Users className="h-4 w-4 mr-2" />Reuniones</TabsTrigger>}
                {mostrar_pestana_cronograma && <TabsTrigger value="cronograma"><Calendar className="h-4 w-4 mr-2" />Cronograma</TabsTrigger>}
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
                            <AlertTitle>Perfil Aprobado</AlertTitle>
                            <AlertDescription>
                              Este es el documento de perfil aprobado. Para subir nuevas versiones del proyecto, usa la pestaña "Doc. Proyecto".
                            </AlertDescription>
                          </Alert>
                      )}

                      <div className="space-y-2">
                        {documentos_perfil_para_mostrar.map((doc) => (
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

                      {documentos_perfil_para_mostrar.length === 0 && (
                        <p className="text-muted-foreground text-center pt-4">
                          No hay documentos de perfil cargados
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

                  {es_asesor && documento_seleccionado && etapa_actual === EtapaProyecto.PERFIL && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/panel/proyecto/${proyecto.id}/crear-observacion`)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Crear Observación (Perfil)
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
                      url_documento={documentosApi.obtenerArchivoUrl(documento_seleccionado.id)}
                      observaciones={observaciones_del_documento}
                      correcciones={correcciones_del_documento}
                      observacion_seleccionada={observacion_seleccionada}
                      correccion_seleccionada={correccion_seleccionada}
                      permitir_descarga={!es_vista_repositorio}
                    />
                  ) : (
                    <Card className="h-[80vh]">
                      <CardContent className="flex justify-center items-center h-full">
                        <p className="text-muted-foreground">
                          {documentos_perfil_para_mostrar.length === 0
                            ? 'No hay documentos de perfil cargados en este proyecto.'
                            : 'Seleccione un documento para visualizar.'}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Pestaña de Documento de Proyecto - Taller II */}
            <TabsContent value="visor-proyecto">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Documentos (Proyecto)</CardTitle>
                      <CardDescription>
                        Documentos del proyecto de Taller de Grado II
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {puede_subir_documento_proyecto && (
                        <div className="space-y-2">
                          <Label htmlFor="file-upload-proyecto" className="cursor-pointer">
                            Seleccionar Archivo PDF (Proyecto)
                          </Label>
                          <Input
                            id="file-upload-proyecto"
                            type="file"
                            accept=".pdf"
                            onChange={(e: any) => set_archivo_proyecto(e.target.files[0])}
                            disabled={subiendo_archivo_proyecto}
                          />
                          {archivo_proyecto && <p className="text-sm text-muted-foreground">{archivo_proyecto.name}</p>}
                          <Button
                            variant="default"
                            className="w-full"
                            onClick={manejarSubidaArchivoProyecto}
                            disabled={!archivo_proyecto || subiendo_archivo_proyecto}
                          >
                            {subiendo_archivo_proyecto ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <FileUp className="mr-2 h-4 w-4" />
                            )}
                            {subiendo_archivo_proyecto ? 'Subiendo...' : 'Subir Documento'}
                          </Button>
                        </div>
                      )}

                      <div className="space-y-2">
                        {documentos_proyecto_para_mostrar.map((doc) => (
                          <div
                            key={doc.id}
                            className={cn(
                              'p-3 rounded-md border cursor-pointer transition-colors',
                              documento_proyecto_seleccionado?.id === doc.id
                                ? 'bg-primary/10 border-primary'
                                : 'hover:bg-accent'
                            )}
                            onClick={() => {
                              set_documento_proyecto_seleccionado(doc);
                              set_observacion_proyecto_seleccionada(null);
                              set_correccion_proyecto_seleccionada(null);
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

                      {documentos_proyecto_para_mostrar.length === 0 && (
                        <p className="text-muted-foreground text-center pt-4">
                          No hay documentos de proyecto cargados
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {es_asesor && documento_proyecto_seleccionado && etapa_actual === EtapaProyecto.PROYECTO && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/panel/proyecto/${proyecto.id}/crear-observacion?tipo=proyecto&documentoId=${documento_proyecto_seleccionado.id}`)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Crear Observación (Proyecto)
                    </Button>
                  )}

                  {es_estudiante && observaciones_del_documento_proyecto.filter(o => o.estado === 'pendiente' || o.estado === 'rechazado').length > 0 && etapa_actual === EtapaProyecto.PROYECTO && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/panel/proyecto/${proyecto.id}/crear-correccion?documentoId=${documento_proyecto_seleccionado?.id}`)}
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
                  {documento_proyecto_seleccionado ? (
                    <VisualizadorDocumento
                      key={documento_proyecto_seleccionado.id}
                      url_documento={documentosApi.obtenerArchivoUrl(documento_proyecto_seleccionado.id)}
                      observaciones={observaciones_del_documento_proyecto}
                      correcciones={correcciones_del_documento_proyecto}
                      observacion_seleccionada={observacion_proyecto_seleccionada}
                      correccion_seleccionada={correccion_proyecto_seleccionada}
                      permitir_descarga={!es_vista_repositorio}
                    />
                  ) : (
                    <Card className="h-[80vh]">
                      <CardContent className="flex justify-center items-center h-full">
                        <p className="text-muted-foreground">
                          {documentos_proyecto_para_mostrar.length === 0
                            ? 'No hay documentos de proyecto cargados. Sube tu primera versión.'
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
                onActualizarProyecto={onActualizarSimple} 
              />
            </TabsContent>

            {mostrar_pestana_cronograma && (
              <TabsContent value="cronograma">
                <PestanaCronograma proyectoId={proyecto.id} />
              </TabsContent>
            )}

            <TabsContent value="defensa">
              <PestanaDefensa proyecto={proyecto} asesores={asesores} onActualizarProyecto={onActualizarSimple} />
            </TabsContent>
          </Tabs>
        );
      }
    }
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