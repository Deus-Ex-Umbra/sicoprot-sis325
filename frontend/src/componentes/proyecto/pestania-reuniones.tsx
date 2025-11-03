import { useState } from 'react';
import { type Proyecto, type Reunion, Rol } from '../../tipos/usuario';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Button } from '../ui/button';
import { Plus, Users } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { EditorHtmlSimple } from '../ui/editor-html-simple';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';
import { reunionesApi } from '../../servicios/api';
import { toast } from 'sonner';

interface PestanaReunionesProps {
  proyecto: Proyecto;
  onActualizarProyecto: () => void;
}

export const PestanaReuniones = ({ proyecto, onActualizarProyecto }: PestanaReunionesProps) => {
  const { usuario } = useAutenticacion();
  const es_asesor = usuario?.rol === Rol.Asesor;

  const [mostrar_modal_crear, set_mostrar_modal_crear] = useState(false);
  const [form_crear, set_form_crear] = useState({
    titulo: '',
    descripcion: '',
    fecha_programada: '',
  });

  const reuniones = proyecto.reuniones || [];

  const manejarCrearReunion = async () => {
    try {
      await reunionesApi.crear({
        ...form_crear,
        id_proyecto: proyecto.id
      });
      toast.success('Reunión programada exitosamente');
      set_mostrar_modal_crear(false);
      onActualizarProyecto();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al programar reunión');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Reuniones de Proyecto</h2>
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
            {reunion.descripcion && <p className="text-sm">{reunion.descripcion}</p>}
            
            {reunion.notas_reunion_html && (
              <Alert>
                <AlertTitle>Notas de la Reunión</AlertTitle>
                <AlertDescription dangerouslySetInnerHTML={{ __html: reunion.notas_reunion_html }} />
              </Alert>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Modal Programar Reunión */}
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
    </div>
  );
};