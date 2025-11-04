import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Search, X, Edit, Trash, MessageSquare } from 'lucide-react';
import { observacionesApi } from '../../servicios/api';
import { type Observacion, EstadoObservacion, Rol } from '../../tipos/usuario';
import { Card, CardContent, CardHeader, CardTitle } from '../../componentes/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../componentes/ui/accordion';
import { Badge } from '../../componentes/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../componentes/ui/select';
import BarraLateral from '../../componentes/barra-lateral';
import BarraLateralAdmin from '../../componentes/barra-lateral-admin';
import { cn } from '../../lib/utilidades';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Button } from '../../componentes/ui/button';
import { Input } from '../../componentes/ui/input';
import { Label } from '../../componentes/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../../componentes/ui/dialog';
import { EditorHtmlSimple } from '../../componentes/ui/editor-html-simple';
import { estadoConfig } from '../../tipos/estado-observacion';

const ObservacionesAsesor = () => {
  const [observaciones, set_observaciones] = useState<Observacion[]>([]);
  const [observaciones_filtradas, set_observaciones_filtradas] = useState<Observacion[]>([]);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  
  const [filtros, set_filtros] = useState({
    busqueda: '',
    estado: '',
  });

  const [mostrar_modal_editar, set_mostrar_modal_editar] = useState(false);
  const [obs_seleccionada, set_obs_seleccionada] = useState<Observacion | null>(null);
  const [form_editar, set_form_editar] = useState({ titulo: '', contenido_html: '', comentarios_asesor_html: '' });
  const [cargando_edicion, set_cargando_edicion] = useState(false);

  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);

  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    cargarObservaciones();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, observaciones]);

  const cargarObservaciones = async () => {
    try {
      const data = await observacionesApi.obtenerMias();
      set_observaciones(data);
      set_observaciones_filtradas(data);
    } catch (err) {
      set_error('Error al cargar observaciones');
    } finally {
      set_cargando(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...observaciones];
    const busqueda_lower = filtros.busqueda.toLowerCase();

    if (busqueda_lower) {
      resultado = resultado.filter(obs => {
        const proyecto = obs.documento?.proyecto || obs.proyecto;
        const estudiante = proyecto?.estudiantes?.[0];
        const nombre_estudiante = estudiante ? `${estudiante.nombre} ${estudiante.apellido}` : '';
        const titulo_proyecto = proyecto?.titulo || '';
        
        return (
          obs.titulo.toLowerCase().includes(busqueda_lower) ||
          obs.contenido_html.toLowerCase().includes(busqueda_lower) ||
          nombre_estudiante.toLowerCase().includes(busqueda_lower) ||
          titulo_proyecto.toLowerCase().includes(busqueda_lower)
        );
      });
    }

    if (filtros.estado) {
      resultado = resultado.filter(obs => obs.estado === filtros.estado);
    }

    set_observaciones_filtradas(resultado);
  };

  const limpiarFiltros = () => {
    set_filtros({
      busqueda: '',
      estado: '',
    });
  };

  const manejarCambioEstado = async (id: number, nuevoEstado: string) => {
    try {
      await observacionesApi.cambiarEstado(id, { estado: nuevoEstado });
      set_observaciones(prev =>
        prev.map(obs => (obs.id === id ? { ...obs, estado: nuevoEstado as EstadoObservacion } : obs))
      );
      toast.success('Estado actualizado correctamente');
    } catch (err) {
      toast.error('Error al actualizar el estado');
    }
  };

  const abrirModalEditar = (obs: Observacion) => {
    set_obs_seleccionada(obs);
    set_form_editar({
      titulo: obs.titulo,
      contenido_html: obs.contenido_html,
      comentarios_asesor_html: obs.comentarios_asesor_html || ''
    });
    set_mostrar_modal_editar(true);
  };

  const manejarGuardarEdicion = async () => {
    if (!obs_seleccionada) return;
    set_cargando_edicion(true);
    try {
      await observacionesApi.actualizar(obs_seleccionada.id, form_editar);
      toast.success('Observación actualizada');
      set_mostrar_modal_editar(false);
      await cargarObservaciones();
    } catch (err) {
      toast.error('Error al actualizar');
    } finally {
      set_cargando_edicion(false);
    }
  };

  const manejarEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta observación?')) return;
    try {
      await observacionesApi.eliminarObservacion(id);
      toast.success('Observación eliminada');
      await cargarObservaciones();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    }
  }

  const obtenerConfigEstado = (estado: string) => {
    return estadoConfig[estado as EstadoObservacion] || estadoConfig[EstadoObservacion.PENDIENTE];
  };

  const hay_filtros_activos = filtros.busqueda || filtros.estado;

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
      <>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="busqueda">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="busqueda"
                    type="text"
                    placeholder="Estudiante, proyecto, título..."
                    value={filtros.busqueda}
                    onChange={(e) => set_filtros({ ...filtros, busqueda: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={filtros.estado}
                  onValueChange={(value) => set_filtros({ ...filtros, estado: value === 'todos' ? '' : value })}
                >
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value={EstadoObservacion.PENDIENTE}>Pendiente</SelectItem>
                    <SelectItem value={EstadoObservacion.EN_REVISION}>En Revisión</SelectItem>
                    <SelectItem value={EstadoObservacion.CORREGIDA}>Corregida</SelectItem>
                    <SelectItem value={EstadoObservacion.RECHAZADO}>Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {hay_filtros_activos && (
              <div className="mt-4 flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={limpiarFiltros}
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpiar Filtros
                </Button>
                <span className="text-muted-foreground text-sm">
                  Mostrando {observaciones_filtradas.length} de {observaciones.length} observaciones
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mis Observaciones a Estudiantes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Observaciones realizadas: {observaciones_filtradas.length}
            </p>
          </CardHeader>
          <CardContent>
            {observaciones_filtradas.length === 0 ? (
              <Alert>
                <AlertDescription>
                  {hay_filtros_activos ? 'No se encontraron observaciones con los filtros aplicados.' : 'No has creado observaciones todavía.'}
                </AlertDescription>
              </Alert>
            ) : (
              <Accordion type="multiple" className="w-full">
                {observaciones_filtradas.map((obs) => {
                  const proyecto = obs.documento?.proyecto || obs.proyecto;
                  const estudiante = proyecto?.estudiantes?.[0];
                  const nombre_estudiante = estudiante
                    ? `${estudiante.nombre} ${estudiante.apellido}`
                    : '—';
                  const titulo_proyecto = proyecto?.titulo || 'Sin proyecto';
                  const config_estado = obtenerConfigEstado(obs.estado);
                  
                  return (
                    <AccordionItem value={`obs-${obs.id}`} key={obs.id}>
                      <AccordionTrigger>
                        <div className="flex flex-col md:flex-row md:items-center justify-between w-full pr-4">
                          <div className="text-left">
                            <Badge variant={config_estado.variant as any} className={cn(config_estado.className)}>
                              {config_estado.label}
                            </Badge>
                            <span className="font-semibold ml-2">{obs.titulo}</span>
                          </div>
                          <div className="text-sm text-muted-foreground text-left md:text-right mt-1 md:mt-0">
                            {titulo_proyecto} ({nombre_estudiante})
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div
                          className="prose prose-sm max-w-none text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: obs.contenido_html }}
                        />
                        {obs.comentarios_asesor_html && (
                          <Alert>
                            <AlertTitle>Comentario Adicional</AlertTitle>
                            <AlertDescription
                              dangerouslySetInnerHTML={{ __html: obs.comentarios_asesor_html }}
                            />
                          </Alert>
                        )}
                        <div className="flex gap-2">
                          <Select
                            value={obs.estado}
                            onValueChange={(value) => manejarCambioEstado(obs.id, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={EstadoObservacion.PENDIENTE}>⏳ Pendiente</SelectItem>
                              <SelectItem value={EstadoObservacion.EN_REVISION}>👀 En Revisión</SelectItem>
                              <SelectItem value={EstadoObservacion.CORREGIDA}>✅ Corregida</SelectItem>
                              <SelectItem value={EstadoObservacion.RECHAZADO}>❌ Rechazado</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm" onClick={() => abrirModalEditar(obs)}>
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => manejarEliminar(obs.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </>
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

        <Dialog open={mostrar_modal_editar} onOpenChange={set_mostrar_modal_editar}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Observación</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-titulo">Título</Label>
                <Input
                  id="edit-titulo"
                  value={form_editar.titulo}
                  onChange={(e) => set_form_editar({ ...form_editar, titulo: e.target.value })}
                  disabled={cargando_edicion}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contenido">Contenido de Observación</Label>
                <EditorHtmlSimple
                  value={form_editar.contenido_html}
                  onChange={(v) => set_form_editar({ ...form_editar, contenido_html: v })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-comentarios">Comentarios Adicionales</Label>
                <EditorHtmlSimple
                  value={form_editar.comentarios_asesor_html}
                  onChange={(v) => set_form_editar({ ...form_editar, comentarios_asesor_html: v })}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={manejarGuardarEdicion} disabled={cargando_edicion}>
                {cargando_edicion ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ObservacionesAsesor;