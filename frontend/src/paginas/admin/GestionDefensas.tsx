import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Calendar, Users, FileText, Eye, Play, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { defensasApi, documentosApi, asesoresApi } from '../../servicios/api';
import { type Defensa, type Proyecto, Rol, type Usuario, TipoDefensa, EstadoDefensa, ResultadoDefensa, EtapaProyecto } from '../../tipos/usuario';
import { toast } from 'sonner';
import { cn } from '../../lib/utilidades';
import BarraLateralAdmin from '../../componentes/barra-lateral-admin';
import BarraLateral from '../../componentes/barra-lateral';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Button } from '../../componentes/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../componentes/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../componentes/ui/table';
import { Badge } from '../../componentes/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../componentes/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../../componentes/ui/dialog';
import { Input } from '../../componentes/ui/input';
import { Label } from '../../componentes/ui/label';
import { Textarea } from '../../componentes/ui/textarea';
import { MultiSelect, type OpcionMultiSelect } from '../../componentes/ui/multi-select';
import { Switch } from '../../componentes/ui/switch';
import { Checkbox } from '../../componentes/ui/checkbox';

type TabActiva = 'pre_defensas' | 'defensas' | 'finalizadas';

const GestionDefensas = () => {
  const [pre_defensas, set_pre_defensas] = useState<Defensa[]>([]);
  const [defensas, set_defensas] = useState<Defensa[]>([]);
  const [defensas_finalizadas, set_defensas_finalizadas] = useState<Defensa[]>([]);
  const [asesores, set_asesores] = useState<Usuario[]>([]);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  const [tab_activa, set_tab_activa] = useState<TabActiva>('pre_defensas');
  
  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);
  const es_admin = usuario?.rol === Rol.Administrador;
  const navigate = useNavigate();

  // Modal para programar defensa
  const [modal_programar, set_modal_programar] = useState(false);
  const [proyecto_seleccionado, set_proyecto_seleccionado] = useState<Proyecto | null>(null);
  const [tipo_defensa_programar, set_tipo_defensa_programar] = useState<TipoDefensa>(TipoDefensa.PRE_DEFENSA);
  const [form_programar, set_form_programar] = useState({
    fecha_programada: '',
    lugar: '',
    enlace: '',
    tribunales: [] as string[],
  });

  // Modal para finalizar defensa
  const [modal_finalizar, set_modal_finalizar] = useState(false);
  const [defensa_seleccionada, set_defensa_seleccionada] = useState<Defensa | null>(null);
  const [form_finalizar, set_form_finalizar] = useState({
    comentarios_admin: '',
    ids_notas_invalidas: [] as number[],
    motivo_invalidacion: '',
  });

  // Modal para reprogramar defensa
  const [modal_reprogramar, set_modal_reprogramar] = useState(false);
  const [proyecto_reprogramar, set_proyecto_reprogramar] = useState<any>(null);
  const [form_reprogramar, set_form_reprogramar] = useState({
    fecha_programada: '',
    lugar: '',
    enlace: '',
    tribunales: [] as string[],
  });

  // Modal para asignar fecha a defensa existente (sin fecha)
  const [modal_asignar_fecha, set_modal_asignar_fecha] = useState(false);
  const [defensa_asignar_fecha, set_defensa_asignar_fecha] = useState<Defensa | null>(null);
  const [form_asignar_fecha, set_form_asignar_fecha] = useState({
    fecha_programada: '',
    lugar: '',
    enlace: '',
    tribunales: [] as string[],
  });

  useEffect(() => {
    cargarDatos();
  }, [tab_activa]);

  const cargarDatos = async () => {
    try {
      set_cargando(true);
      
      const [asesores_data] = await Promise.all([
        asesoresApi.obtenerTodos(),
      ]);
      set_asesores(asesores_data);

      if (tab_activa === 'pre_defensas') {
        const data = await defensasApi.obtenerTodasPreDefensas();
        set_pre_defensas(data);
      } else if (tab_activa === 'defensas') {
        const data = await defensasApi.obtenerTodasDefensas();
        set_defensas(data);
      } else if (tab_activa === 'finalizadas') {
        const data = await defensasApi.obtenerDefensasFinalizadas();
        set_defensas_finalizadas(data);
      }
    } catch (err: any) {
      set_error(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      set_cargando(false);
    }
  };

  const opciones_tribunales: OpcionMultiSelect[] = asesores.map(a => ({
    value: String(a.perfil?.id_asesor),
    label: `${a.perfil?.nombre} ${a.perfil?.apellido}`
  }));

  const abrirModalProgramar = (proyecto: Proyecto, tipo: TipoDefensa) => {
    // Filtrar asesores para excluir al asesor del proyecto
    set_proyecto_seleccionado(proyecto);
    set_tipo_defensa_programar(tipo);
    set_form_programar({
      fecha_programada: '',
      lugar: '',
      enlace: '',
      tribunales: [],
    });
    set_modal_programar(true);
  };

  const abrirModalProgramarDesdeDefensa = (defensa: Defensa) => {
    set_proyecto_seleccionado(defensa.proyecto);
    set_tipo_defensa_programar(TipoDefensa.DEFENSA);
    set_form_programar({
      fecha_programada: '',
      lugar: '',
      enlace: '',
      tribunales: [],
    });
    set_modal_programar(true);
  };

  const manejarProgramarDefensa = async () => {
    if (!proyecto_seleccionado) return;

    if (form_programar.tribunales.length < 3) {
      toast.error('Debe seleccionar al menos 3 tribunales');
      return;
    }

    try {
      // Validar que el asesor del proyecto no esté en el tribunal
      const ids_tribunales = form_programar.tribunales.map(id => parseInt(id));
      const validacion = await defensasApi.validarTribunal(proyecto_seleccionado.id, ids_tribunales);
      
      if (!validacion.valido) {
        toast.error(validacion.errores.join(', '));
        return;
      }

      await defensasApi.programarDefensa({
        id_proyecto: proyecto_seleccionado.id,
        fecha_programada: form_programar.fecha_programada,
        lugar: form_programar.lugar,
        enlace: form_programar.enlace,
        tipo: tipo_defensa_programar,
        ids_tribunales,
      });

      toast.success(`${tipo_defensa_programar === TipoDefensa.PRE_DEFENSA ? 'Pre-defensa' : 'Defensa'} programada exitosamente`);
      set_modal_programar(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al programar la defensa');
    }
  };

  const iniciarDefensa = async (id: number) => {
    try {
      await defensasApi.iniciarDefensa(id);
      toast.success('Defensa iniciada');
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al iniciar la defensa');
    }
  };

  const abrirModalFinalizar = (defensa: Defensa) => {
    set_defensa_seleccionada(defensa);
    set_form_finalizar({
      comentarios_admin: '',
      ids_notas_invalidas: [],
      motivo_invalidacion: '',
    });
    set_modal_finalizar(true);
  };

  const manejarFinalizarDefensa = async () => {
    if (!defensa_seleccionada) return;

    try {
      await defensasApi.finalizarDefensa(defensa_seleccionada.id, form_finalizar);
      toast.success('Defensa finalizada');
      set_modal_finalizar(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al finalizar la defensa');
    }
  };

  const rehabilitarProyecto = async (id_proyecto: number) => {
    try {
      await defensasApi.rehabilitarDefensa(id_proyecto);
      toast.success('Proyecto rehabilitado para nueva defensa');
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al rehabilitar el proyecto');
    }
  };

  const abrirModalReprogramar = (proyecto_data: any) => {
    set_proyecto_reprogramar(proyecto_data);
    set_form_reprogramar({
      fecha_programada: '',
      lugar: '',
      enlace: '',
      tribunales: [],
    });
    set_modal_reprogramar(true);
  };

  const abrirModalReprogramarDesdeDefensa = (defensa: Defensa) => {
    // Convertir la defensa al formato que usa el modal de reprogramar
    set_proyecto_reprogramar({
      proyecto: defensa.proyecto,
      tipo_a_reprogramar: defensa.tipo,
      ultima_defensa: defensa,
    });
    set_form_reprogramar({
      fecha_programada: '',
      lugar: '',
      enlace: '',
      tribunales: [],
    });
    set_modal_reprogramar(true);
  };

  const abrirModalAsignarFecha = (defensa: Defensa) => {
    set_defensa_asignar_fecha(defensa);
    set_form_asignar_fecha({
      fecha_programada: '',
      lugar: '',
      enlace: '',
      tribunales: [],
    });
    set_modal_asignar_fecha(true);
  };

  const manejarAsignarFecha = async () => {
    if (!defensa_asignar_fecha) return;

    if (form_asignar_fecha.tribunales.length < 3) {
      toast.error('Debe seleccionar al menos 3 tribunales');
      return;
    }

    try {
      const ids_tribunales = form_asignar_fecha.tribunales.map(id => parseInt(id));
      const validacion = await defensasApi.validarTribunal(defensa_asignar_fecha.proyecto.id, ids_tribunales);
      
      if (!validacion.valido) {
        toast.error(validacion.errores.join(', '));
        return;
      }

      await defensasApi.asignarFechaDefensa(defensa_asignar_fecha.id, {
        id_proyecto: defensa_asignar_fecha.proyecto.id,
        fecha_programada: form_asignar_fecha.fecha_programada,
        lugar: form_asignar_fecha.lugar,
        enlace: form_asignar_fecha.enlace,
        tipo: defensa_asignar_fecha.tipo,
        ids_tribunales,
      });

      toast.success(`${defensa_asignar_fecha.tipo === TipoDefensa.PRE_DEFENSA ? 'Pre-defensa' : 'Defensa'} programada exitosamente`);
      set_modal_asignar_fecha(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al programar la defensa');
    }
  };

  const manejarReprogramarDefensa = async () => {
    if (!proyecto_reprogramar) return;

    if (form_reprogramar.tribunales.length < 3) {
      toast.error('Debe seleccionar al menos 3 tribunales');
      return;
    }

    try {
      const ids_tribunales = form_reprogramar.tribunales.map(id => parseInt(id));
      const validacion = await defensasApi.validarTribunal(proyecto_reprogramar.proyecto.id, ids_tribunales);
      
      if (!validacion.valido) {
        toast.error(validacion.errores.join(', '));
        return;
      }

      await defensasApi.reprogramarDefensa(proyecto_reprogramar.proyecto.id, {
        id_proyecto: proyecto_reprogramar.proyecto.id,
        fecha_programada: form_reprogramar.fecha_programada,
        lugar: form_reprogramar.lugar,
        enlace: form_reprogramar.enlace,
        tipo: proyecto_reprogramar.tipo_a_reprogramar,
        ids_tribunales,
      });

      toast.success(`${proyecto_reprogramar.tipo_a_reprogramar === TipoDefensa.PRE_DEFENSA ? 'Pre-defensa' : 'Defensa'} reprogramada exitosamente`);
      set_modal_reprogramar(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al reprogramar la defensa');
    }
  };

  const getBadgeEstadoDefensa = (defensa: Defensa) => {
    switch (defensa.estado) {
      case EstadoDefensa.PROGRAMADA:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Programada</Badge>;
      case EstadoDefensa.EN_CURSO:
        return <Badge variant="default" className="bg-blue-600"><Play className="h-3 w-3 mr-1" /> En Curso</Badge>;
      case EstadoDefensa.FINALIZADA:
        if (defensa.resultado === ResultadoDefensa.APROBADO) {
          return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Aprobada</Badge>;
        } else {
          return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Reprobada</Badge>;
        }
      default:
        return <Badge variant="outline">{defensa.estado}</Badge>;
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const renderTablaDefensas = (lista: Defensa[], mostrar_acciones_finalizar: boolean = true) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Proyecto</TableHead>
          <TableHead>Estudiante(s)</TableHead>
          <TableHead>Fecha Programada</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Nota</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lista.map((defensa) => {
          const sin_fecha_programada = !defensa.fecha_programada;
          const tiene_tribunales = defensa.tribunales && defensa.tribunales.length > 0;
          const pendiente_programar = sin_fecha_programada || !tiene_tribunales;
          
          return (
            <TableRow key={defensa.id}>
              <TableCell className="font-medium">{defensa.proyecto?.titulo}</TableCell>
              <TableCell>
                {defensa.proyecto?.estudiantes?.map(e => `${e.nombre} ${e.apellido}`).join(', ') || 'N/A'}
              </TableCell>
              <TableCell>
                {defensa.fecha_programada ? formatearFecha(defensa.fecha_programada) : (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Sin programar
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={defensa.tipo === TipoDefensa.PRE_DEFENSA ? 'outline' : 'default'}>
                  {defensa.tipo === TipoDefensa.PRE_DEFENSA ? 'Pre-Defensa' : 'Defensa Final'}
                </Badge>
              </TableCell>
              <TableCell>{getBadgeEstadoDefensa(defensa)}</TableCell>
              <TableCell>
                {defensa.nota_promedio !== null && defensa.nota_promedio !== undefined 
                  ? `${defensa.nota_promedio.toFixed(1)}` 
                  : '-'}
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/panel/proyecto/${defensa.proyecto?.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                {/* Botón para programar/asignar fecha a defensa que no tiene fecha */}
                {pendiente_programar && defensa.estado === EstadoDefensa.PROGRAMADA && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => abrirModalAsignarFecha(defensa)}
                  >
                    <Calendar className="h-4 w-4 mr-1" /> Programar
                  </Button>
                )}
                
                {/* Botón para iniciar defensa que ya tiene fecha programada */}
                {!pendiente_programar && defensa.estado === EstadoDefensa.PROGRAMADA && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => iniciarDefensa(defensa.id)}
                  >
                    <Play className="h-4 w-4 mr-1" /> Iniciar
                  </Button>
                )}
                
                {defensa.estado === EstadoDefensa.EN_CURSO && mostrar_acciones_finalizar && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => abrirModalFinalizar(defensa)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Finalizar
                  </Button>
                )}

                {defensa.estado === EstadoDefensa.FINALIZADA && 
                 defensa.resultado === ResultadoDefensa.REPROBADO &&
                 defensa.intento_numero < 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => abrirModalReprogramarDesdeDefensa(defensa)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" /> Reprogramar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  let contenido_pagina;

  if (cargando) {
    contenido_pagina = (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  } else if (error) {
    contenido_pagina = (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  } else {
    contenido_pagina = (
      <Tabs value={tab_activa} onValueChange={(v) => set_tab_activa(v as TabActiva)}>
        <TabsList className="mb-4">
          <TabsTrigger value="pre_defensas">Pre-Defensas</TabsTrigger>
          <TabsTrigger value="defensas">Defensas Finales</TabsTrigger>
          <TabsTrigger value="finalizadas">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="pre_defensas">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Defensas</CardTitle>
              <CardDescription>Todas las pre-defensas (pendientes de programar, programadas, en curso y finalizadas)</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTablaDefensas(pre_defensas)}
              {pre_defensas.length === 0 && (
                <p className="text-muted-foreground text-center py-10">
                  No hay pre-defensas registradas.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defensas">
          <Card>
            <CardHeader>
              <CardTitle>Defensas Finales</CardTitle>
              <CardDescription>Todas las defensas finales (pendientes de programar, programadas, en curso y finalizadas)</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTablaDefensas(defensas)}
              {defensas.length === 0 && (
                <p className="text-muted-foreground text-center py-10">
                  No hay defensas finales registradas.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finalizadas">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Defensas</CardTitle>
              <CardDescription>Todas las defensas finalizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTablaDefensas(defensas_finalizadas, false)}
              {defensas_finalizadas.length === 0 && (
                <p className="text-muted-foreground text-center py-10">
                  No hay defensas finalizadas.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );
  }

  // Obtener opciones filtradas de tribunales (excluir asesor del proyecto)
  const opciones_tribunales_filtradas = opciones_tribunales.filter(opt => {
    if (!proyecto_seleccionado?.asesor) return true;
    return opt.value !== String(proyecto_seleccionado.asesor.id);
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background) / 1)' }}>
      {es_admin ? (
        <BarraLateralAdmin isOpen={sidebar_open} />
      ) : (
        <BarraLateral isOpen={sidebar_open} />
      )}

      <main className={cn('transition-all duration-300', sidebar_open ? 'ml-64' : 'ml-0')}>
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestión de Defensas</h1>
              <p className="text-muted-foreground">Administra pre-defensas y defensas finales</p>
            </div>
          </div>

          {contenido_pagina}
        </div>
      </main>

      {/* Modal Programar Defensa */}
      <Dialog open={modal_programar} onOpenChange={set_modal_programar}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Programar {tipo_defensa_programar === TipoDefensa.PRE_DEFENSA ? 'Pre-Defensa' : 'Defensa Final'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Proyecto:</strong> {proyecto_seleccionado?.titulo}
                <br />
                <strong>Asesor:</strong> {proyecto_seleccionado?.asesor?.nombre} {proyecto_seleccionado?.asesor?.apellido}
                <br />
                <span className="text-destructive">El asesor del proyecto NO puede ser parte del tribunal.</span>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="fecha_programada">Fecha y Hora</Label>
              <Input
                id="fecha_programada"
                type="datetime-local"
                value={form_programar.fecha_programada}
                onChange={(e) => set_form_programar({ ...form_programar, fecha_programada: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lugar">Lugar</Label>
              <Input
                id="lugar"
                placeholder="Aula, sala de conferencias..."
                value={form_programar.lugar}
                onChange={(e) => set_form_programar({ ...form_programar, lugar: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enlace">Enlace de reunión virtual (opcional)</Label>
              <Input
                id="enlace"
                placeholder="https://meet.google.com/..."
                value={form_programar.enlace}
                onChange={(e) => set_form_programar({ ...form_programar, enlace: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Seleccionar Tribunal (mínimo 3)</Label>
              <MultiSelect
                opciones={opciones_tribunales_filtradas}
                seleccionados={form_programar.tribunales}
                onChange={(valores) => set_form_programar({ ...form_programar, tribunales: valores })}
                placeholder="Seleccionar docentes..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={manejarProgramarDefensa} disabled={!form_programar.fecha_programada || form_programar.tribunales.length < 3}>
              Programar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Finalizar Defensa */}
      <Dialog open={modal_finalizar} onOpenChange={set_modal_finalizar}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Finalizar Defensa</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {defensa_seleccionada && (
              <>
                <div className="space-y-2">
                  <h4 className="font-semibold">Calificaciones del Tribunal:</h4>
                  {defensa_seleccionada.tribunales?.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`invalida-${t.id}`}
                          checked={form_finalizar.ids_notas_invalidas.includes(t.id)}
                          onCheckedChange={(checked: boolean | 'indeterminate') => {
                            if (checked === true) {
                              set_form_finalizar({
                                ...form_finalizar,
                                ids_notas_invalidas: [...form_finalizar.ids_notas_invalidas, t.id],
                              });
                            } else {
                              set_form_finalizar({
                                ...form_finalizar,
                                ids_notas_invalidas: form_finalizar.ids_notas_invalidas.filter(id => id !== t.id),
                              });
                            }
                          }}
                        />
                        <label htmlFor={`invalida-${t.id}`} className="text-sm">
                          Invalidar
                        </label>
                      </div>
                      <span>{t.asesor?.nombre} {t.asesor?.apellido}</span>
                      <span className="font-semibold">
                        {t.ha_calificado ? (
                          t.asistencia_confirmada ? t.calificacion?.toFixed(1) || '-' : 'No asistió'
                        ) : (
                          'Sin calificar'
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {form_finalizar.ids_notas_invalidas.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="motivo">Motivo de invalidación</Label>
                    <Textarea
                      id="motivo"
                      value={form_finalizar.motivo_invalidacion}
                      onChange={(e) => set_form_finalizar({ ...form_finalizar, motivo_invalidacion: e.target.value })}
                      placeholder="Explique por qué se invalidan las notas seleccionadas..."
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="comentarios">Comentarios del Administrador</Label>
                  <Textarea
                    id="comentarios"
                    value={form_finalizar.comentarios_admin}
                    onChange={(e) => set_form_finalizar({ ...form_finalizar, comentarios_admin: e.target.value })}
                    placeholder="Comentarios adicionales sobre la defensa..."
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={manejarFinalizarDefensa}>
              Finalizar y Calcular Resultado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Reprogramar Defensa */}
      <Dialog open={modal_reprogramar} onOpenChange={set_modal_reprogramar}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Reprogramar {proyecto_reprogramar?.tipo_a_reprogramar === TipoDefensa.PRE_DEFENSA ? 'Pre-Defensa' : 'Defensa Final'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Proyecto:</strong> {proyecto_reprogramar?.proyecto?.titulo}
                <br />
                <strong>Intento anterior:</strong> #{proyecto_reprogramar?.ultima_defensa?.intento_numero || 1}
                <br />
                <strong>Nota anterior:</strong> {proyecto_reprogramar?.ultima_defensa?.nota_promedio?.toFixed(1) || '0'} / 100
                <br />
                <span className="text-amber-600">
                  Este será el intento #{proyecto_reprogramar?.intento_siguiente || 2}
                </span>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="fecha_reprogramar">Fecha y Hora</Label>
              <Input
                id="fecha_reprogramar"
                type="datetime-local"
                value={form_reprogramar.fecha_programada}
                onChange={(e) => set_form_reprogramar({ ...form_reprogramar, fecha_programada: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lugar_reprogramar">Lugar</Label>
              <Input
                id="lugar_reprogramar"
                placeholder="Aula, sala de conferencias..."
                value={form_reprogramar.lugar}
                onChange={(e) => set_form_reprogramar({ ...form_reprogramar, lugar: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enlace_reprogramar">Enlace de reunión virtual (opcional)</Label>
              <Input
                id="enlace_reprogramar"
                placeholder="https://meet.google.com/..."
                value={form_reprogramar.enlace}
                onChange={(e) => set_form_reprogramar({ ...form_reprogramar, enlace: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Seleccionar Tribunal (mínimo 3)</Label>
              <MultiSelect
                opciones={opciones_tribunales.filter(opt => 
                  opt.value !== String(proyecto_reprogramar?.proyecto?.asesor?.id)
                )}
                seleccionados={form_reprogramar.tribunales}
                onChange={(valores) => set_form_reprogramar({ ...form_reprogramar, tribunales: valores })}
                placeholder="Seleccionar docentes..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={manejarReprogramarDefensa} 
              disabled={!form_reprogramar.fecha_programada || form_reprogramar.tribunales.length < 3}
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Reprogramar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Asignar Fecha a Defensa */}
      <Dialog open={modal_asignar_fecha} onOpenChange={set_modal_asignar_fecha}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Programar {defensa_asignar_fecha?.tipo === TipoDefensa.PRE_DEFENSA ? 'Pre-Defensa' : 'Defensa Final'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                <strong>Proyecto:</strong> {defensa_asignar_fecha?.proyecto?.titulo}
                <br />
                <strong>Estudiante(s):</strong> {defensa_asignar_fecha?.proyecto?.estudiantes?.map(e => `${e.nombre} ${e.apellido}`).join(', ')}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="fecha_asignar">Fecha y Hora</Label>
              <Input
                id="fecha_asignar"
                type="datetime-local"
                value={form_asignar_fecha.fecha_programada}
                onChange={(e) => set_form_asignar_fecha({ ...form_asignar_fecha, fecha_programada: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lugar_asignar">Lugar</Label>
              <Input
                id="lugar_asignar"
                placeholder="Aula, sala de conferencias..."
                value={form_asignar_fecha.lugar}
                onChange={(e) => set_form_asignar_fecha({ ...form_asignar_fecha, lugar: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enlace_asignar">Enlace de reunión virtual (opcional)</Label>
              <Input
                id="enlace_asignar"
                placeholder="https://meet.google.com/..."
                value={form_asignar_fecha.enlace}
                onChange={(e) => set_form_asignar_fecha({ ...form_asignar_fecha, enlace: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Seleccionar Tribunal (mínimo 3)</Label>
              <MultiSelect
                opciones={opciones_tribunales.filter(opt => 
                  opt.value !== String(defensa_asignar_fecha?.proyecto?.asesor?.id)
                )}
                seleccionados={form_asignar_fecha.tribunales}
                onChange={(valores) => set_form_asignar_fecha({ ...form_asignar_fecha, tribunales: valores })}
                placeholder="Seleccionar docentes..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={manejarAsignarFecha} 
              disabled={!form_asignar_fecha.fecha_programada || form_asignar_fecha.tribunales.length < 3}
            >
              <Calendar className="h-4 w-4 mr-1" /> Programar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GestionDefensas;
