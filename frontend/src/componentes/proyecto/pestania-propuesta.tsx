import { useState } from 'react';
import { type Proyecto, type PropuestaTema, Rol } from '../../tipos/usuario';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { EditorHtmlSimple } from '../ui/editor-html-simple';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';
import { propuestasTemaApi, proyectosApi } from '../../servicios/api';
import { toast } from 'sonner';

interface PestanaPropuestasProps {
  proyecto: Proyecto;
  onActualizarProyecto: () => void;
}

export const PestanaPropuestas = ({ proyecto, onActualizarProyecto }: PestanaPropuestasProps) => {
  const { usuario } = useAutenticacion();
  const es_estudiante = usuario?.rol === Rol.Estudiante;
  const es_asesor = usuario?.rol === Rol.Asesor;

  const [mostrar_modal_crear, set_mostrar_modal_crear] = useState(false);
  const [mostrar_modal_responder, set_mostrar_modal_responder] = useState(false);
  const [propuesta_seleccionada, set_propuesta_seleccionada] = useState<PropuestaTema | null>(null);
  
  const [form_crear, set_form_crear] = useState({ titulo: '', cuerpo_html: '' });
  const [form_responder, set_form_responder] = useState({ accion: 'aprobada' as 'aprobada' | 'rechazada', comentarios_asesor_html: '' });

  const puede_crear = es_estudiante && proyecto.etapa_actual === 'propuesta';
  const propuestas = proyecto.propuestas_tema || [];

  const manejarCrearPropuesta = async () => {
    try {
      await propuestasTemaApi.crear({
        ...form_crear,
        id_proyecto: proyecto.id
      });
      toast.success('Propuesta enviada exitosamente');
      set_mostrar_modal_crear(false);
      onActualizarProyecto();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear propuesta');
    }
  };

  const manejarResponderPropuesta = async () => {
    if (!propuesta_seleccionada) return;
    try {
      await propuestasTemaApi.responder(propuesta_seleccionada.id, form_responder);
      toast.success('Respuesta enviada exitosamente');
      set_mostrar_modal_responder(false);
      onActualizarProyecto();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al responder');
    }
  };

  const abrirModalResponder = (propuesta: PropuestaTema) => {
    set_propuesta_seleccionada(propuesta);
    set_form_responder({ accion: 'aprobada', comentarios_asesor_html: '' });
    set_mostrar_modal_responder(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Propuestas de Tema</h2>
          <p className="text-muted-foreground">Gestión de temas para Taller de Grado I</p>
        </div>
        {puede_crear && (
          <Button onClick={() => set_mostrar_modal_crear(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Propuesta
          </Button>
        )}
      </div>

      {propuestas.length === 0 && (
        <Alert>
          <AlertTitle>Sin Propuestas</AlertTitle>
          <AlertDescription>
            {es_estudiante ? 'Aún no has enviado ninguna propuesta de tema.' : 'El estudiante aún no ha enviado ninguna propuesta.'}
          </AlertDescription>
        </Alert>
      )}

      {propuestas.map(propuesta => (
        <Card key={propuesta.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{propuesta.titulo}</CardTitle>
              <Badge variant={propuesta.estado === 'aprobada' ? 'default' : (propuesta.estado === 'rechazada' ? 'destructive' : 'secondary')}>
                {propuesta.estado}
              </Badge>
            </div>
            <CardDescription>
              Enviada el: {new Date(propuesta.fecha_creacion).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: propuesta.cuerpo_html }} />
            
            {propuesta.comentarios_asesor_html && (
              <Alert variant={propuesta.estado === 'aprobada' ? 'default' : 'destructive'}>
                <AlertTitle>Respuesta del Asesor</AlertTitle>
                <AlertDescription dangerouslySetInnerHTML={{ __html: propuesta.comentarios_asesor_html }} />
              </Alert>
            )}

            {es_asesor && propuesta.estado === 'pendiente' && (
              <Button size="sm" onClick={() => abrirModalResponder(propuesta)}>
                Responder Propuesta
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Modal Crear Propuesta */}
      <Dialog open={mostrar_modal_crear} onOpenChange={set_mostrar_modal_crear}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Nueva Propuesta de Tema</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo-propuesta">Título</Label>
              <Input id="titulo-propuesta" value={form_crear.titulo} onChange={(e) => set_form_crear({...form_crear, titulo: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuerpo-propuesta">Cuerpo de la Propuesta</Label>
              <EditorHtmlSimple value={form_crear.cuerpo_html} onChange={(v) => set_form_crear({...form_crear, cuerpo_html: v})} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={manejarCrearPropuesta}>Enviar Propuesta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Responder Propuesta */}
      <Dialog open={mostrar_modal_responder} onOpenChange={set_mostrar_modal_responder}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Responder a: {propuesta_seleccionada?.titulo}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Acción</Label>
              <select
                value={form_responder.accion}
                onChange={(e) => set_form_responder({ ...form_responder, accion: e.target.value as any })}
                className="w-full p-2 border rounded-md"
              >
                <option value="aprobada">Aprobar</option>
                <option value="rechazada">Rechazar</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comentarios-asesor">Comentarios</Label>
              <EditorHtmlSimple value={form_responder.comentarios_asesor_html} onChange={(v) => set_form_responder({...form_responder, comentarios_asesor_html: v})} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={manejarResponderPropuesta}>Enviar Respuesta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};