import React, { useState } from 'react';
import { Clock, Eye, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { EstadoObservacion, estadoConfig, type EstadoObservacion as TipoEstadoObservacion } from '../tipos/estadoObservacion';
import { observacionesApi } from '../servicios/api';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import type { Observacion } from '../tipos/usuario';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { cn } from '../lib/utilidades';

interface Props {
  observacion: Observacion;
  onEstadoCambiado: (observacionActualizada: Observacion) => void;
}

const iconos = {
  'clock': Clock,
  'eye': Eye,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
};

const CambiarEstadoObservacion: React.FC<Props> = ({
  observacion,
  onEstadoCambiado,
}) => {
  const { usuario } = useAutenticacion();
  const [mostrar_modal, set_mostrar_modal] = useState(false);
  const [nuevo_estado, set_nuevo_estado] = useState<EstadoObservacion>(
    observacion.estado as EstadoObservacion || EstadoObservacion.PENDIENTE
  );
  const [comentarios, set_comentarios] = useState('');
  const [cargando, set_cargando] = useState(false);
  const [error, set_error] = useState('');

  const es_asesor = usuario?.rol === 'asesor';

  const handleCambiarEstado = async () => {
    if (!observacion?.id) {
      set_error('ID de observación no válido');
      return;
    }

    set_cargando(true);
    set_error('');

    try {
      const resultado = await observacionesApi.cambiarEstado(
        observacion.id,
        {
          estado: nuevo_estado,
          comentarios_asesor: comentarios.trim() || undefined,
        }
      );

      toast.success('Estado cambiado exitosamente.');
      onEstadoCambiado(resultado.observacion);
      handleCerrarModal();
    } catch (err: any) {
      const mensaje_error = err.response?.data?.message || 'Error al cambiar el estado';
      set_error(mensaje_error);
      toast.error(mensaje_error);
    } finally {
      set_cargando(false);
    }
  };

  const handleAbrirModal = () => {
    set_mostrar_modal(true);
    set_nuevo_estado(observacion.estado as EstadoObservacion || EstadoObservacion.PENDIENTE);
    set_comentarios('');
    set_error('');
  };

  const handleCerrarModal = () => {
    if (cargando) return;
    set_mostrar_modal(false);
    set_error('');
  };

  if (!observacion || !es_asesor) {
    return null;
  }

  const estado_actual_config = estadoConfig[observacion.estado as EstadoObservacion];
  const estado_cambiado = nuevo_estado !== observacion.estado;

  const estados_permitidos = (() => {
    switch (observacion.estado) {
      case EstadoObservacion.PENDIENTE:
        return [EstadoObservacion.EN_REVISION];
      case EstadoObservacion.EN_REVISION:
        return [EstadoObservacion.APROBADO, EstadoObservacion.RECHAZADO];
      case EstadoObservacion.CORREGIDO:
        return [EstadoObservacion.EN_REVISION];
      case EstadoObservacion.RECHAZADO:
        return [EstadoObservacion.EN_REVISION];
      default:
        return [];
    }
  })();

  const IconoActual =
    iconos[estado_actual_config?.icon as keyof typeof iconos] || Clock;

  return (
    <Dialog open={mostrar_modal} onOpenChange={set_mostrar_modal}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-yellow-500 border-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-600"
          onClick={handleAbrirModal}
        >
          Cambiar Estado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cambiar Estado de Observación</DialogTitle>
          <DialogDescription>
            Actualiza el estado de la observación y notifica al estudiante.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="mb-4 p-4 bg-muted/50 rounded-lg space-y-2">
            <h6 className="font-semibold text-foreground mb-2">
              {observacion.titulo}
            </h6>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {observacion.contenido}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Estado actual:</span>
              <Badge
                variant="outline"
                className={cn(estado_actual_config?.className)}
              >
                <IconoActual className="h-3 w-3 mr-1.5" />
                {estado_actual_config?.label}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nuevo_estado">Nuevo Estado</Label>
            <Select
              value={nuevo_estado}
              onValueChange={(value) => set_nuevo_estado(value as TipoEstadoObservacion)}
              disabled={cargando}
            >
              <SelectTrigger id="nuevo_estado">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={observacion.estado}>
                  {estado_actual_config?.label} (actual)
                </SelectItem>
                {estados_permitidos.map((valor) => {
                  const config = estadoConfig[valor];
                  const Icono = iconos[config?.icon as keyof typeof iconos] || Clock;
                  return (
                    <SelectItem key={valor} value={valor}>
                      <div className="flex items-center gap-2">
                        <Icono className="h-4 w-4" />
                        <span>{config?.label || valor}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comentarios">
              <MessageSquare size={16} className="mr-2 inline" />
              Comentarios para el Estudiante (Opcional)
            </Label>
            <Textarea
              id="comentarios"
              value={comentarios}
              onChange={(e) => set_comentarios(e.target.value)}
              disabled={cargando}
              placeholder="Agregue comentarios para guiar al estudiante..."
              maxLength={500}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground text-right">
              {comentarios.length}/500 caracteres
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertTitle>Nota</AlertTitle>
            <AlertDescription>
              El estudiante recibirá una notificación cuando se cambie el estado de esta observación.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={handleCerrarModal} disabled={cargando}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={handleCambiarEstado}
            disabled={cargando || !estado_cambiado}
          >
            {cargando ? 'Cambiando...' : 'Confirmar Cambio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CambiarEstadoObservacion;