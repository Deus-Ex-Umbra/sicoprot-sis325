import { useState } from 'react';
import { type Proyecto, type Reunion, type Observacion, Rol, EstadoObservacion } from '../../tipos/usuario';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Button } from '../ui/button';
import { Plus, Users, MessageSquare, Edit, CheckCircle, Trash } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { EditorHtmlSimple } from '../ui/editor-html-simple';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';
import { reunionesApi, observacionesApi } from '../../servicios/api';
import { toast } from 'sonner';
import { Separator } from '../ui/separator';

interface PestanaReunionesProps {
  proyecto: Proyecto;
  observaciones: Observacion[];
  onActualizarProyecto: () => void;
}

export const PestanaReuniones = ({ proyecto, observaciones, onActualizarProyecto }: PestanaReunionesProps) => {
  const { usuario } = useAutenticacion();
  const es_asesor = usuario?.rol === Rol.Asesor;
  const [mostrar_modal_crear, set_mostrar_modal_crear] = useState(false);
  const [form_crear, set_form_crear] = useState({
    titulo: '',
    descripcion: '',
    fecha_programada: '',
  });
  const reuniones = proyecto.reuniones || [];
  const [mostrar_modal_obs, set_mostrar_modal_obs] = useState(false);
  const [obs_editando, set_obs_editando] = useState<Observacion | null>(null);
  const [form_obs, set_form_obs] = useState({ titulo: '', contenido_html: '' });

  const manejarCrearReunion = async () => {
    try {
      await reunionesApi.crear({
        ...form_crear,
        id_proyecto: proyecto.id
      });
      toast.success('Reunión programada exitosamente');
      set_form_crear({ titulo: '', descripcion: '', fecha_programada: '' });
      set_mostrar_modal_crear(false);
      onActualizarProyecto();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al programar reunión');
    }
  };

  const manejarGuardarObservacion = async () => {
    try {
      if (obs_editando) {
        await observacionesApi.actualizar(obs_editando.id, form_obs);
        toast.success('Observación actualizada');
      } else {
        await observacionesApi.crearParaProyecto(proyecto.id, form_obs);
        toast.success('Observación creada exitosamente');
      }
      set_mostrar_modal_obs(false);
      set_obs_editando(null);
      onActualizarProyecto();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar observación');
    }
  };

  const abrirModalObs = (obs: Observacion | null) => {
    if (obs) {
      set_obs_editando(obs);
      set_form_obs({ titulo: obs.titulo, contenido_html: obs.contenido_html });
    } else {
      set_obs_editando(null);
      set_form_obs({ titulo: '', contenido_html: '' });
    }
    set_mostrar_modal_obs(true);
  };

  const manejarMarcarSubsanada = async (obs_id: number) => {
    if (!window.confirm('¿Está seguro de marcar esta observación como subsanada?')) return;
    try {
      await observacionesApi.cambiarEstado(obs_id, { estado: EstadoObservacion.CORREGIDA });
      toast.success('Observación marcada como subsanada');
      onActualizarProyecto();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar estado');
    }
  };

  const manejarEliminarObservacion = async (obs_id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta observación?')) return;
    try {
      await observacionesApi.eliminarObservacion(obs_id);
      toast.success('Observación eliminada');
      onActualizarProyecto();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const obtenerVarianteBadge = (estado: string) => {
    switch (estado) {
      case EstadoObservacion.PENDIENTE:
      case EstadoObservacion.RECHAZADO:
        return 'destructive';
      case EstadoObservacion.CORREGIDA:
        return 'default';
      case EstadoObservacion.EN_REVISION:
        return 'secondary';
      default:
        return 'outline';
    }
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Users /> Reuniones de Proyecto
            </h2>
            <p className="text-muted-foreground">Gestión de reuniones para Taller de Grado II</p>
          </div>
          {es_asesor && (
            <Button onClick={() => set_mostrar_modal_crear(true)}>
              <Plus className="mr-2 h-4 w-4" /> Programar Reunión
            </Button>
          )}
        </div>

        {reuniones.length === 0 && (
          <Alert>
            <AlertTitle>Sin Reuniones</AlertTitle>
            <AlertDescription>
              {es_asesor ? 'Aún no has programado ninguna reunión.' : 'Tu asesor aún no ha programado ninguna reunión.'}
            </AlertDescription>
          </Alert>
        )}

        {reuniones.map(reunion => (
          <Card key={reunion.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{reunion.titulo}</CardTitle>
                <Badge variant={reunion.estado === 'realizada' ? 'default' : (reunion.estado === 'cancelada' ? 'destructive' : 'secondary')}>
                  {reunion.estado}
                </Badge>
              </div>
              <CardDescription>
                Programada para: {new Date(reunion.fecha_programada).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reunion.descripcion && (
                <div
                  className="text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: reunion.descripcion }}
                />
              )}
              
              {reunion.notas_reunion_html && (
                <Alert>
                  <AlertTitle>Notas de la Reunión</AlertTitle>
                  <AlertDescription 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: reunion.notas_reunion_html }} 
                  />
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <MessageSquare /> Observaciones (Taller II)
            </h2>
            <p className="text-muted-foreground">Observaciones generales a nivel de proyecto.</p>
          </div>
          {es_asesor && (
            <Button onClick={() => abrirModalObs(null)}>
              <Plus className="mr-2 h-4 w-4" /> Nueva Observación
            </Button>
          )}
        </div>

        {observaciones.length === 0 && (
          <Alert>
            <AlertTitle>Sin Observaciones</AlertTitle>
            <AlertDescription>
              {es_asesor ? 'Aún no has creado ninguna observación para este proyecto.' : 'No hay observaciones generales para este proyecto.'}
            </AlertDescription>
          </Alert>
        )}

        {observaciones.map(obs => (
          <Card key={obs.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{obs.titulo}</CardTitle>
                <Badge variant={obtenerVarianteBadge(obs.estado)}>
                  {obs.estado}
                </Badge>
              </div>
              <CardDescription>
                Creada el: {new Date(obs.fecha_creacion).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: obs.contenido_html }} 
              />
              
              {obs.comentarios_asesor_html && (
                <Alert variant="default">
                  <AlertTitle>Último Comentario del Asesor</AlertTitle>
                  <AlertDescription 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: obs.comentarios_asesor_html }} 
                  />
                </Alert>
              )}

              {es_asesor && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => abrirModalObs(obs)}>
                    <Edit className="mr-2 h-4 w-4" /> Editar Comentario
                  </Button>
                  {obs.estado !== EstadoObservacion.CORREGIDA && (
                    <Button variant="default" size="sm" onClick={() => manejarMarcarSubsanada(obs.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Marcar Subsanada
                    </Button>
                  )}
                   <Button variant="destructive" size="icon" onClick={() => manejarEliminarObservacion(obs.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={mostrar_modal_crear} onOpenChange={set_mostrar_modal_crear}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Programar Nueva Reunión</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo-reunion">Título</Label>
              <Input id="titulo-reunion" value={form_crear.titulo} onChange={(e) => set_form_crear({...form_crear, titulo: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha-reunion">Fecha y Hora</Label>
              <Input id="fecha-reunion" type="datetime-local" value={form_crear.fecha_programada} onChange={(e) => set_form_crear({...form_crear, fecha_programada: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc-reunion">Descripción (Opcional)</Label>
              <EditorHtmlSimple value={form_crear.descripcion} onChange={(v) => set_form_crear({...form_crear, descripcion: v})} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={manejarCrearReunion}>Programar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={mostrar_modal_obs} onOpenChange={set_mostrar_modal_obs}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{obs_editando ? 'Editar' : 'Nueva'} Observación (Taller II)</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="obs-titulo">Título</Label>
              <Input 
                id="obs-titulo" 
                value={form_obs.titulo} 
                onChange={(e) => set_form_obs({...form_obs, titulo: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="obs-contenido">Contenido / Comentario</Label>
              <EditorHtmlSimple 
                value={form_obs.contenido_html} 
                onChange={(v) => set_form_obs({...form_obs, contenido_html: v})} 
                placeholder="Escriba la observación o el comentario..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={manejarGuardarObservacion}>
              {obs_editando ? 'Actualizar' : 'Crear'} Observación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};