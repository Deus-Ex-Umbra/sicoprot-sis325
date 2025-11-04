import { useState } from 'react';
import { type Proyecto, type Usuario, Rol } from '../../tipos/usuario';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Button } from '../ui/button';
import { Send, ShieldCheck, ShieldOff, Upload, FileText, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';
import { proyectosApi, documentosApi, api } from '../../servicios/api';
import { toast } from 'sonner';
import { MultiSelect, type OpcionMultiSelect } from '../ui/multi-select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { cn } from '../../lib/utilidades';

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
  
  const [form_responder, set_form_responder] = useState({
    aprobada: true,
    comentarios: '',
    tribunales: [] as string[]
  });

  const opciones_tribunales: OpcionMultiSelect[] = asesores.map(a => ({
    value: JSON.stringify({ nombre: `${a.perfil?.nombre} ${a.perfil?.apellido}`, correo: a.correo || '' }),
    label: `${a.perfil?.nombre} ${a.perfil?.apellido}`
  }));

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
    const tribunales_seleccionados = form_responder.tribunales.map(t => JSON.parse(t));
    
    if (form_responder.aprobada && (tribunales_seleccionados.length < 3 || tribunales_seleccionados.length > 5)) {
      toast.error('Debe seleccionar entre 3 y 5 tribunales para aprobar.');
      return;
    }
    
    try {
      await proyectosApi.responderSolicitudDefensa(proyecto.id, {
        aprobada: form_responder.aprobada,
        comentarios: form_responder.comentarios,
        tribunales: tribunales_seleccionados
      });
      toast.success('Respuesta enviada exitosamente');
      set_mostrar_modal_responder(false);
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

          {proyecto.tribunales && proyecto.tribunales.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Tribunales Asignados</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {proyecto.tribunales.map((t, i) => (
                  <li key={i}>{t.nombre} ({t.correo})</li>
                ))}
              </ul>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Responder Solicitud de Defensa</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
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
                  {form_responder.aprobada ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
                </Label>
              </div>
            </div>
            
            {form_responder.aprobada && (
              <div className="space-y-2">
                <Label>Seleccionar Tribunales (3 a 5)</Label>
                <MultiSelect
                  opciones={opciones_tribunales}
                  seleccionados={form_responder.tribunales}
                  onChange={(valores) => set_form_responder({ ...form_responder, tribunales: valores })}
                  placeholder="Seleccionar docentes..."
                  max_seleccion={5}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="comentarios-admin">Comentarios (Requerido si se rechaza)</Label>
              <Textarea
                id="comentarios-admin"
                value={form_responder.comentarios}
                onChange={(e) => set_form_responder({ ...form_responder, comentarios: e.target.value })}
                placeholder="Explique el motivo del rechazo o agregue notas de aprobación..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={manejarResponderDefensa}>
              {form_responder.aprobada ? 'Aprobar y Finalizar' : 'Rechazar Solicitud'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};