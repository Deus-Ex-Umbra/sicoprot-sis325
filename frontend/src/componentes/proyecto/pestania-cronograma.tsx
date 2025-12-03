import { useState, useEffect } from 'react';
import { cronogramaApi } from '../../servicios/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Loader2, Plus, Save, Check, X, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Rol } from '../../tipos/usuario';

interface PestanaCronogramaProps {
  proyectoId: number;
}

export const PestanaCronograma = ({ proyectoId }: PestanaCronogramaProps) => {
  const { usuario } = useAutenticacion();
  const es_asesor = usuario?.rol === Rol.Asesor;
  const es_estudiante = usuario?.rol === Rol.Estudiante;

  const [cronograma, setCronograma] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    cargarCronograma();
  }, [proyectoId]);

  const cargarCronograma = async () => {
    try {
      const data = await cronogramaApi.obtenerPorProyecto(proyectoId);
      setCronograma(data);
      setItems(data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const guardarPropuesta = async () => {
    try {
      if (es_asesor) {
        await cronogramaApi.proponer(proyectoId, { items });
      } else {
        await cronogramaApi.cambiarPropuesta(cronograma.id, { items });
      }
      toast.success('Propuesta guardada');
      setEditando(false);
      cargarCronograma();
    } catch (error) {
      toast.error('Error al guardar propuesta');
    }
  };

  const aceptarPropuesta = async () => {
    try {
      await cronogramaApi.aceptarPropuesta(cronograma.id);
      toast.success('Propuesta aceptada');
      cargarCronograma();
    } catch (error) {
      toast.error('Error al aceptar propuesta');
    }
  };

  const reconfirmarPropuesta = async () => {
    try {
      await cronogramaApi.reconfirmarPropuesta(cronograma.id);
      toast.success('Propuesta reconfirmada');
      cargarCronograma();
    } catch (error) {
      toast.error('Error al reconfirmar propuesta');
    }
  };

  const agregarItem = () => {
    setItems([...items, { actividad: '', fecha_inicio: '', fecha_fin: '' }]);
  };

  const actualizarItem = (index: number, campo: string, valor: string) => {
    const nuevosItems = [...items];
    nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };
    setItems(nuevosItems);
  };

  const eliminarItem = (index: number) => {
    const nuevosItems = items.filter((_, i) => i !== index);
    setItems(nuevosItems);
  };

  if (cargando) return <Loader2 className="animate-spin" />;

  const puede_editar = (es_asesor && (!cronograma || cronograma.estado === 'pendiente_docente' || cronograma.estado === 'observado_estudiante')) ||
                       (es_estudiante && cronograma?.estado === 'pendiente_estudiante');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cronograma de Actividades</h3>
        <div className="flex gap-2">
            {cronograma?.estado && <Badge>{cronograma.estado}</Badge>}
            {!editando && puede_editar && (
                <Button onClick={() => setEditando(true)} size="sm"><Edit className="mr-2 h-4 w-4"/> Editar</Button>
            )}
            {editando && (
                <>
                    <Button variant="outline" onClick={() => { setEditando(false); setItems(cronograma.items || []); }} size="sm"><X className="mr-2 h-4 w-4"/> Cancelar</Button>
                    <Button onClick={guardarPropuesta} size="sm"><Save className="mr-2 h-4 w-4"/> Guardar Propuesta</Button>
                </>
            )}
            {!editando && es_estudiante && cronograma?.estado === 'pendiente_estudiante' && (
                <Button onClick={aceptarPropuesta} size="sm" variant="default"><Check className="mr-2 h-4 w-4"/> Aceptar Propuesta</Button>
            )}
            {!editando && es_asesor && cronograma?.estado === 'aceptado_estudiante' && (
                <Button onClick={reconfirmarPropuesta} size="sm" variant="default"><Check className="mr-2 h-4 w-4"/> Reconfirmar</Button>
            )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
            <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 font-semibold border-b pb-2">
                    <div className="col-span-6">Actividad</div>
                    <div className="col-span-3">Inicio</div>
                    <div className="col-span-3">Fin</div>
                </div>
                {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-6">
                            {editando ? (
                                <Input value={item.actividad} onChange={(e) => actualizarItem(index, 'actividad', e.target.value)} placeholder="Actividad" />
                            ) : (
                                <span>{item.actividad}</span>
                            )}
                        </div>
                        <div className="col-span-3">
                            {editando ? (
                                <Input type="date" value={item.fecha_inicio} onChange={(e) => actualizarItem(index, 'fecha_inicio', e.target.value)} />
                            ) : (
                                <span>{item.fecha_inicio}</span>
                            )}
                        </div>
                        <div className="col-span-3 flex items-center gap-2">
                            {editando ? (
                                <>
                                    <Input type="date" value={item.fecha_fin} onChange={(e) => actualizarItem(index, 'fecha_fin', e.target.value)} />
                                    <Button variant="ghost" size="icon" onClick={() => eliminarItem(index)} className="text-red-500"><X className="h-4 w-4"/></Button>
                                </>
                            ) : (
                                <span>{item.fecha_fin}</span>
                            )}
                        </div>
                    </div>
                ))}
                {editando && (
                    <Button variant="outline" onClick={agregarItem} className="w-full mt-4"><Plus className="mr-2 h-4 w-4"/> Agregar Actividad</Button>
                )}
                {items.length === 0 && !editando && <p className="text-muted-foreground text-center py-4">No hay actividades definidas.</p>}
            </div>
        </CardContent>
      </Card>
    </div>
  );
};
