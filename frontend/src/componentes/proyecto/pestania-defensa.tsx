import { useState, useEffect } from 'react';
import { type Proyecto, type Usuario, Rol, TipoDefensa, EstadoDefensa, ResultadoDefensa, EtapaProyecto, Defensa } from '../../tipos/usuario';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Button } from '../ui/button';
import { Send, FileText, Loader2, CheckCircle, Clock, Calendar, MapPin, Link, AlertTriangle, Award, XCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';
import { proyectosApi, documentosApi, defensasApi, asesoresApi } from '../../servicios/api';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { cn } from '../../lib/utilidades';
import { Progress } from '../ui/progress';
import { MultiSelect, type OpcionMultiSelect } from '../ui/multi-select';

interface PestanaDefensaProps {
  proyecto: Proyecto;
  asesores: Usuario[];
  onActualizarProyecto: () => void;
}

export const PestanaDefensa = ({ proyecto, asesores, onActualizarProyecto }: PestanaDefensaProps) => {
  const { usuario } = useAutenticacion();
  const es_estudiante = usuario?.rol === Rol.Estudiante;
  const es_admin = usuario?.rol === Rol.Administrador;

  const [mostrar_modal_solicitar, set_mostrar_modal_solicitar] = useState(false);
  const [mostrar_modal_responder, set_mostrar_modal_responder] = useState(false);
  
  const [archivo_memorial, set_archivo_memorial] = useState<File | null>(null);
  const [subiendo_memorial, set_subiendo_memorial] = useState(false);
  
  const [defensas, setDefensas] = useState<Defensa[]>([]);
  const [cargandoDefensas, setCargandoDefensas] = useState(false);

  const [asesores_disponibles, set_asesores_disponibles] = useState<Usuario[]>([]);
  const [cargando_asesores, set_cargando_asesores] = useState(false);

  const [form_responder, set_form_responder] = useState({
    aprobada: true,
    comentarios: '',
    fecha_programada: '',
    lugar: '',
    enlace: '',
    ids_tribunales: [] as string[],
  });

  // Cargar asesores cuando se abre el modal de responder
  useEffect(() => {
    if (mostrar_modal_responder && es_admin) {
      cargarAsesores();
    }
  }, [mostrar_modal_responder, es_admin]);

  const cargarAsesores = async () => {
    set_cargando_asesores(true);
    try {
      const data = await asesoresApi.obtenerTodos();
      // Filtrar para excluir al asesor del proyecto
      const asesores_filtrados = data.filter((a: Usuario) => 
        a.perfil?.id_asesor !== proyecto.asesor?.id
      );
      set_asesores_disponibles(asesores_filtrados);
    } catch (error) {
      console.error('Error cargando asesores:', error);
      toast.error('Error al cargar la lista de asesores');
    } finally {
      set_cargando_asesores(false);
    }
  };

  const opciones_tribunales: OpcionMultiSelect[] = asesores_disponibles.map(a => ({
    value: String(a.perfil?.id_asesor),
    label: `${a.perfil?.nombre} ${a.perfil?.apellido}`
  }));

  // Cargar defensas del proyecto
  useEffect(() => {
    if (proyecto.id && (
      proyecto.etapa_actual === EtapaProyecto.SOLICITUD_DEFENSA ||
      proyecto.etapa_actual === EtapaProyecto.PRE_DEFENSA ||
      proyecto.etapa_actual === EtapaProyecto.EN_DEFENSA ||
      proyecto.etapa_actual === EtapaProyecto.TERMINADO ||
      proyecto.etapa_actual === EtapaProyecto.REPROBADO
    )) {
      cargarDefensas();
    }
  }, [proyecto.id, proyecto.etapa_actual]);

  const cargarDefensas = async () => {
    setCargandoDefensas(true);
    try {
      const data = await defensasApi.obtenerDefensasPorProyecto(proyecto.id);
      setDefensas(data);
    } catch (error) {
      console.error('Error cargando defensas:', error);
    } finally {
      setCargandoDefensas(false);
    }
  };

  const manejarSolicitarDefensa = async () => {
    if (!archivo_memorial) {
      toast.error('Debe adjuntar el archivo memorial.');
      return;
    }

    set_subiendo_memorial(true);
    
    try {
      const form_data = new FormData();
      form_data.append('memorial', archivo_memorial);
      
      await proyectosApi.solicitarDefensa(proyecto.id, form_data);
      
      toast.success('Solicitud de defensa enviada exitosamente');
      set_mostrar_modal_solicitar(false);
      set_archivo_memorial(null);
      onActualizarProyecto();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al enviar la solicitud');
    } finally {
      set_subiendo_memorial(false);
    }
  };

  const manejarResponderDefensa = async () => {
    // Validaciones cuando se aprueba
    if (form_responder.aprobada) {
      if (form_responder.ids_tribunales.length < 3) {
        toast.error('Debe seleccionar al menos 3 miembros del tribunal');
        return;
      }
      if (!form_responder.fecha_programada) {
        toast.error('Debe especificar una fecha para la pre-defensa');
        return;
      }
    }

    try {
      const datos: any = {
        aprobada: form_responder.aprobada,
        comentarios: form_responder.comentarios,
      };

      // Solo enviar campos de programación si se aprueba
      if (form_responder.aprobada) {
        datos.fecha_programada = form_responder.fecha_programada;
        datos.lugar = form_responder.lugar;
        datos.enlace = form_responder.enlace;
        datos.ids_tribunales = form_responder.ids_tribunales.map(id => parseInt(id));
      }

      await proyectosApi.responderSolicitudDefensa(proyecto.id, datos);
      toast.success(form_responder.aprobada 
        ? 'Memorial aceptado y pre-defensa programada exitosamente.' 
        : 'Solicitud de defensa rechazada.');
      set_mostrar_modal_responder(false);
      // Limpiar formulario
      set_form_responder({
        aprobada: true,
        comentarios: '',
        fecha_programada: '',
        lugar: '',
        enlace: '',
        ids_tribunales: [],
      });
      onActualizarProyecto();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al responder la solicitud');
    }
  };

  const getEstadoDefensa = () => {
    switch (proyecto.etapa_actual) {
      case 'listo_defensa':
        return {
          titulo: 'Listo para Solicitar Defensa',
          descripcion: 'El asesor ha marcado el proyecto como listo. Ahora puedes enviar tu solicitud.',
          badge: <Badge variant="secondary">Listo</Badge>
        };
      case 'solicitud_defensa':
        return {
          titulo: 'Solicitud Enviada',
          descripcion: 'Tu solicitud de defensa ha sido enviada y está pendiente de revisión por administración.',
          badge: <Badge variant="default">En Revisión</Badge>
        };
      case EtapaProyecto.PRE_DEFENSA:
        return {
          titulo: 'Memorial Aceptado - Pendiente Pre-Defensa',
          descripcion: 'Tu memorial ha sido aceptado. Administración programará tu pre-defensa próximamente.',
          badge: <Badge variant="default" className="bg-blue-600">Pre-Defensa</Badge>
        };
      case EtapaProyecto.EN_DEFENSA:
        return {
          titulo: 'Pre-Defensa Aprobada - Pendiente Defensa Final',
          descripcion: '¡Excelente! Has aprobado la pre-defensa. Tu defensa final será programada próximamente.',
          badge: <Badge variant="default" className="bg-purple-600">Defensa</Badge>
        };
      case EtapaProyecto.REPROBADO:
        return {
          titulo: 'Proyecto Reprobado',
          descripcion: 'Lamentablemente, no has aprobado las defensas requeridas. Contacta a administración para más información.',
          badge: <Badge variant="destructive">Reprobado</Badge>
        };
      case 'terminado':
        return {
          titulo: 'Proyecto Terminado',
          descripcion: '¡Felicidades! Tu proyecto ha sido aprobado y la defensa ha concluido.',
          badge: <Badge variant="default" className="bg-green-600">Terminado</Badge>
        };
      default:
        return {
          titulo: 'Etapa no completada',
          descripcion: 'Debes completar las etapas de Perfil y Proyecto antes de solicitar la defensa.',
          badge: <Badge variant="outline">Pendiente</Badge>
        };
    }
  };

  const estado = getEstadoDefensa();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{estado.titulo}</CardTitle>
            {estado.badge}
          </div>
          <CardDescription>{estado.descripcion}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {es_estudiante && proyecto.etapa_actual === 'listo_defensa' && (
            <Button onClick={() => set_mostrar_modal_solicitar(true)}>
              <Send className="mr-2 h-4 w-4" /> Solicitar Defensa
            </Button>
          )}

          {es_admin && proyecto.etapa_actual === 'solicitud_defensa' && (
            <Button onClick={() => set_mostrar_modal_responder(true)}>
              Responder Solicitud
            </Button>
          )}
          
          {proyecto.ruta_memorial && (
             <Button variant="outline" asChild>
                <a href={documentosApi.obtenerArchivoPorRutaUrl(proyecto.ruta_memorial)} target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-2 h-4 w-4" /> Ver Memorial Enviado
                </a>
            </Button>
          )}

          {proyecto.comentarios_defensa && (
            <Alert>
              <AlertTitle>Comentarios de Administración</AlertTitle>
              <AlertDescription>{proyecto.comentarios_defensa}</AlertDescription>
            </Alert>
          )}

          {/* Mensaje informativo cuando el memorial fue aceptado pero no hay defensas programadas */}
          {(proyecto.etapa_actual === EtapaProyecto.PRE_DEFENSA || proyecto.etapa_actual === EtapaProyecto.EN_DEFENSA) && 
           defensas.length === 0 && !cargandoDefensas && (
            <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
              <Clock className="h-4 w-4" />
              <AlertTitle>Esperando Programación</AlertTitle>
              <AlertDescription>
                {proyecto.etapa_actual === EtapaProyecto.PRE_DEFENSA 
                  ? 'Tu memorial ha sido aceptado. Administración programará tu pre-defensa próximamente. Te notificaremos cuando la fecha y el tribunal estén definidos.'
                  : 'Has aprobado la pre-defensa. Administración programará tu defensa final próximamente.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Indicador de carga de defensas */}
          {cargandoDefensas && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando información de defensas...</span>
            </div>
          )}

          {/* Sección de Defensas del Proyecto */}
          {defensas.length > 0 && (
            <div className="space-y-4 mt-6">
              <h4 className="font-semibold text-lg border-b pb-2">Historial de Defensas</h4>
              {defensas.map((defensa, idx) => (
                <Card key={defensa.id} className={cn(
                  "border-l-4",
                  defensa.resultado === ResultadoDefensa.APROBADO ? "border-l-green-500" :
                  defensa.resultado === ResultadoDefensa.REPROBADO ? "border-l-red-500" :
                  "border-l-blue-500"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {defensa.tipo === TipoDefensa.PRE_DEFENSA ? 'Pre-Defensa' : 'Defensa Final'}
                          {defensa.intento_numero > 1 && (
                            <Badge variant="outline" className="text-xs">Intento #{defensa.intento_numero}</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {defensa.fecha_programada 
                            ? new Date(defensa.fecha_programada).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Fecha por confirmar'}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {defensa.resultado === ResultadoDefensa.APROBADO && (
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" /> Aprobada
                          </Badge>
                        )}
                        {defensa.resultado === ResultadoDefensa.REPROBADO && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" /> Reprobada
                          </Badge>
                        )}
                        {!defensa.resultado && defensa.estado === EstadoDefensa.PROGRAMADA && (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" /> Programada
                          </Badge>
                        )}
                        {!defensa.resultado && defensa.estado === EstadoDefensa.EN_CURSO && (
                          <Badge className="bg-yellow-600 animate-pulse">
                            En Curso
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Información del lugar/enlace */}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {defensa.lugar && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {defensa.lugar}
                        </div>
                      )}
                      {defensa.enlace && (
                        <a href={defensa.enlace} target="_blank" rel="noopener noreferrer" 
                           className="flex items-center gap-1 text-primary hover:underline">
                          <Link className="h-4 w-4" /> Enlace Virtual
                        </a>
                      )}
                    </div>

                    {/* Nota promedio si está disponible */}
                    {defensa.nota_promedio !== null && defensa.nota_promedio !== undefined && (
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Nota Promedio Final</span>
                          <span className={cn(
                            "text-2xl font-bold",
                            defensa.nota_promedio >= 51 ? "text-green-600" : "text-red-600"
                          )}>
                            {defensa.nota_promedio}/100
                          </span>
                        </div>
                        <Progress 
                          value={defensa.nota_promedio} 
                          className={cn(
                            "h-2",
                            defensa.nota_promedio >= 51 ? "[&>div]:bg-green-600" : "[&>div]:bg-red-600"
                          )}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Nota mínima de aprobación: {defensa.nota_minima_aprobacion || 51}
                        </p>
                      </div>
                    )}

                    {/* Observaciones generales */}
                    {defensa.observaciones_generales && (
                      <Alert>
                        <AlertTitle>Observaciones del Tribunal</AlertTitle>
                        <AlertDescription>{defensa.observaciones_generales}</AlertDescription>
                      </Alert>
                    )}

                    {/* Comentarios del admin */}
                    {defensa.comentarios_admin && (
                      <Alert variant="default">
                        <AlertTitle>Comentarios de Administración</AlertTitle>
                        <AlertDescription>{defensa.comentarios_admin}</AlertDescription>
                      </Alert>
                    )}

                    {/* Miembros del tribunal con sus notas */}
                    {defensa.tribunales && defensa.tribunales.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4" /> Evaluaciones del Tribunal
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {defensa.tribunales.map((tribunal, tidx) => (
                            <Card key={tidx} className={cn(
                              "p-3",
                              tribunal.nota_valida === false && "opacity-60 border-dashed"
                            )}>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium text-sm">
                                    {tribunal.nombre || (tribunal.asesor ? `${tribunal.asesor.nombre} ${tribunal.asesor.apellido}` : 'Tribunal')}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {tribunal.correo || tribunal.asesor?.usuario?.correo || ''}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {tribunal.asistencia_confirmada && (
                                    <Badge variant="outline" className="text-green-600 text-xs">
                                      <CheckCircle className="h-3 w-3 mr-1" /> Asistió
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {tribunal.ha_calificado && (
                                <div className="mt-2 space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">Nota:</span>
                                    <span className={cn(
                                      "font-bold",
                                      tribunal.nota_valida === false ? "text-muted-foreground line-through" :
                                      (tribunal.nota || tribunal.calificacion || 0) >= 51 ? "text-green-600" : "text-red-600"
                                    )}>
                                      {tribunal.nota || tribunal.calificacion || 0}/100
                                    </span>
                                  </div>
                                  {tribunal.nota_valida === false && (
                                    <p className="text-xs text-red-500">
                                      Nota invalidada: {tribunal.motivo_invalidacion}
                                    </p>
                                  )}
                                </div>
                              )}

                              {tribunal.comentarios_correccion && (
                                <div className="mt-2 text-sm bg-muted/50 p-2 rounded">
                                  <span className="font-medium text-xs">Comentarios:</span>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {tribunal.comentarios_correccion}
                                  </p>
                                </div>
                              )}

                              {(tribunal.opinion || tribunal.observaciones) && (
                                <div className="mt-2 text-sm bg-muted/50 p-2 rounded">
                                  <span className="font-medium text-xs">Opinión:</span>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {tribunal.opinion || tribunal.observaciones}
                                  </p>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tribunales antiguos (legacy) - mantener por compatibilidad */}
          {proyecto.tribunales && proyecto.tribunales.length > 0 && defensas.length === 0 && (
            <div>
              <h4 className="font-semibold mb-2">Tribunales Asignados</h4>
              <div className="space-y-3">
                {proyecto.tribunales.map((t: any, i: number) => (
                  <Card key={i} className="p-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium">{t.nombre}</p>
                            <p className="text-xs text-muted-foreground">{t.correo}</p>
                        </div>
                        {t.asistencia_confirmada && <Badge variant="secondary" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1"/> Asiste</Badge>}
                    </div>
                    {t.opinion && (
                        <div className="mt-2 text-sm bg-muted/50 p-2 rounded">
                            <span className="font-semibold">Opinión:</span> {t.opinion}
                        </div>
                    )}
                    {t.nota && (
                        <div className="mt-2 text-sm flex justify-between items-center">
                            <span><span className="font-semibold">Nota:</span> {t.nota}</span>
                            {t.comentario_evaluacion && <span className="text-muted-foreground italic text-xs">{t.comentario_evaluacion}</span>}
                        </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={mostrar_modal_solicitar} onOpenChange={set_mostrar_modal_solicitar}>
        <DialogContent>
          <DialogHeader><DialogTitle>Solicitar Defensa de Proyecto</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <Alert>
              <AlertDescription>
                Para solicitar tu defensa, debes adjuntar el archivo "memorial" (o documento equivalente) en formato PDF.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="memorial-file">Archivo Memorial (PDF)</Label>
              <Input
                id="memorial-file"
                type="file"
                accept=".pdf"
                onChange={(e) => set_archivo_memorial(e.target.files ? e.target.files[0] : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={manejarSolicitarDefensa} disabled={!archivo_memorial || subiendo_memorial}>
              {subiendo_memorial ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enviar Solicitud'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={mostrar_modal_responder} onOpenChange={set_mostrar_modal_responder}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Responder Solicitud de Defensa</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <Alert>
              <AlertDescription>
                {form_responder.aprobada 
                  ? 'Al aceptar el memorial, se creará automáticamente la pre-defensa con el tribunal y la fecha que especifique.'
                  : 'Al rechazar la solicitud, el estudiante podrá volver a enviarla después de corregir los problemas indicados.'}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label>Decisión</Label>
              <div className="flex items-center space-x-3">
                <Switch
                  id="decision-aprobada"
                  checked={form_responder.aprobada}
                  onCheckedChange={(checked) => set_form_responder({ ...form_responder, aprobada: checked })}
                />
                <Label
                  htmlFor="decision-aprobada"
                  className={cn(
                    "font-medium",
                    form_responder.aprobada ? "text-green-600" : "text-destructive"
                  )}
                >
                  {form_responder.aprobada ? 'Aceptar Memorial' : 'Rechazar Solicitud'}
                </Label>
              </div>
            </div>

            {/* Campos adicionales cuando se aprueba */}
            {form_responder.aprobada && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Programar Pre-Defensa
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fecha-predefensa">Fecha y Hora *</Label>
                      <Input
                        id="fecha-predefensa"
                        type="datetime-local"
                        value={form_responder.fecha_programada}
                        onChange={(e) => set_form_responder({ ...form_responder, fecha_programada: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lugar-predefensa">Lugar</Label>
                      <Input
                        id="lugar-predefensa"
                        placeholder="Ej: Aula 201, Edificio A"
                        value={form_responder.lugar}
                        onChange={(e) => set_form_responder({ ...form_responder, lugar: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="enlace-predefensa">Enlace Virtual (opcional)</Label>
                    <Input
                      id="enlace-predefensa"
                      placeholder="https://meet.google.com/..."
                      value={form_responder.enlace}
                      onChange={(e) => set_form_responder({ ...form_responder, enlace: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Tribunal (mínimo 3 docentes) *
                  </h4>
                  
                  {cargando_asesores ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Cargando asesores...</span>
                    </div>
                  ) : (
                    <>
                      <MultiSelect
                        opciones={opciones_tribunales}
                        seleccionados={form_responder.ids_tribunales}
                        onChange={(valores) => set_form_responder({ ...form_responder, ids_tribunales: valores })}
                        placeholder="Seleccionar miembros del tribunal..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Seleccionados: {form_responder.ids_tribunales.length} de mínimo 3
                        {proyecto.asesor && (
                          <span className="ml-2">(El asesor del proyecto ha sido excluido automáticamente)</span>
                        )}
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="comentarios-admin">Comentarios {!form_responder.aprobada && '(Requerido)'}</Label>
              <Textarea
                id="comentarios-admin"
                value={form_responder.comentarios}
                onChange={(e) => set_form_responder({ ...form_responder, comentarios: e.target.value })}
                placeholder={form_responder.aprobada 
                  ? "Notas adicionales (opcional)..." 
                  : "Explique el motivo del rechazo..."}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button 
              onClick={manejarResponderDefensa}
              disabled={form_responder.aprobada && (form_responder.ids_tribunales.length < 3 || !form_responder.fecha_programada)}
            >
              {form_responder.aprobada ? 'Aceptar y Programar Pre-Defensa' : 'Rechazar Solicitud'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};