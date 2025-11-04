import { useState } from 'react';
import { type Proyecto, EtapaProyecto, TipoGrupo } from '../../tipos/usuario';
import { Button } from '../ui/button';
import { CheckCircle, ShieldCheck, Send, AlertTriangle, FileCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../ui/dialog';
import { proyectosApi } from '../../servicios/api';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface PestanaAccionesProps {
  proyecto: Proyecto;
  observaciones_pendientes: number;
  tipo_grupo_actual: TipoGrupo | null;
  onActualizarProyecto: () => void;
}

export const PestanaAcciones = ({ proyecto, observaciones_pendientes, tipo_grupo_actual, onActualizarProyecto }: PestanaAccionesProps) => {
  const [mostrar_modal, set_mostrar_modal] = useState(false);
  const [etapa_a_aprobar, set_etapa_a_aprobar] = useState<EtapaProyecto | null>(null);
  const [comentarios, set_comentarios] = useState('');

  const abrirModal = (etapa: EtapaProyecto) => {
    set_etapa_a_aprobar(etapa);
    set_comentarios('');
    set_mostrar_modal(true);
  };

  const manejarAprobarEtapa = async () => {
    if (!etapa_a_aprobar) return;
    try {
      await proyectosApi.aprobarEtapa(proyecto.id, {
        etapa: etapa_a_aprobar,
        comentarios: comentarios
      });
      toast.success(`Etapa "${etapa_a_aprobar}" aprobada exitosamente`);
      set_mostrar_modal(false);
      onActualizarProyecto();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al aprobar la etapa');
    }
  };

  const getTituloModal = () => {
    switch (etapa_a_aprobar) {
      case EtapaProyecto.PROPUESTA: return 'Aprobar Propuesta (Taller I)';
      case EtapaProyecto.PERFIL: return 'Aprobar Perfil (Taller I)';
      case EtapaProyecto.PROYECTO: return 'Marcar como Listo para Defensa (Taller II)';
      default: return 'Confirmar Acción';
    }
  };

  const getDescripcionModal = () => {
    switch (etapa_a_aprobar) {
      case EtapaProyecto.PROPUESTA:
        return 'Está a punto de aprobar la Propuesta de Tema. El proyecto pasará a la etapa de "Perfil". Esta acción no se puede deshacer.';
      case EtapaProyecto.PERFIL:
        return 'Está a punto de aprobar el Perfil. El proyecto pasará a la etapa de "Proyecto" (Taller II). Esta acción no se puede deshacer.';
      case EtapaProyecto.PROYECTO:
        return 'Está a punto de marcar el Proyecto como "Listo para Defensa". El estudiante ahora podrá solicitar su defensa a administración. Esta acción no se puede deshacer.';
      default:
        return 'Confirme esta acción.';
    }
  };

  const es_taller_i = tipo_grupo_actual === TipoGrupo.TALLER_GRADO_I;
  const es_taller_ii = tipo_grupo_actual === TipoGrupo.TALLER_GRADO_II;

  const puede_aprobar_propuesta = es_taller_i && proyecto.etapa_actual === EtapaProyecto.PROPUESTA;
  const puede_aprobar_perfil = es_taller_i && proyecto.etapa_actual === EtapaProyecto.PERFIL && observaciones_pendientes === 0;
  const puede_aprobar_proyecto = es_taller_ii && proyecto.etapa_actual === EtapaProyecto.PROYECTO && observaciones_pendientes === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones de Asesor</CardTitle>
        <CardDescription>Aprobar etapas y gestionar el avance del proyecto.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {observaciones_pendientes > 0 && 
         (proyecto.etapa_actual === EtapaProyecto.PERFIL || proyecto.etapa_actual === EtapaProyecto.PROYECTO) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No se pueden aprobar etapas mientras existan {observaciones_pendientes} observaciones pendientes en la etapa actual.
            </AlertDescription>
          </Alert>
        )}

        {es_taller_i && (
          <>
            <Button
              className="w-full"
              disabled={!puede_aprobar_propuesta}
              onClick={() => abrirModal(EtapaProyecto.PROPUESTA)}
            >
              <FileCheck className="mr-2 h-4 w-4" /> Aprobar Propuesta (Taller I)
            </Button>

            <Button
              className="w-full"
              disabled={!puede_aprobar_perfil}
              onClick={() => abrirModal(EtapaProyecto.PERFIL)}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Aprobar Etapa de Perfil (Taller I)
            </Button>
          </>
        )}
        
        {es_taller_ii && (
          <Button
            className="w-full"
            disabled={!puede_aprobar_proyecto}
            onClick={() => abrirModal(EtapaProyecto.PROYECTO)}
          >
            <ShieldCheck className="mr-2 h-4 w-4" /> Marcar como Listo para Defensa (Taller II)
          </Button>
        )}

      </CardContent>
      <Dialog open={mostrar_modal} onOpenChange={set_mostrar_modal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getTituloModal()}</DialogTitle>
            <DialogDescription>{getDescripcionModal()}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="comentarios-aprobacion">Comentarios (Opcional)</Label>
            <Textarea
              id="comentarios-aprobacion"
              value={comentarios}
              onChange={(e) => set_comentarios(e.target.value)}
              placeholder="Mensaje de aprobación o notas finales..."
            />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={manejarAprobarEtapa}>Confirmar Aprobación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};