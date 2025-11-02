import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CheckCircle, Clock, Eye, XCircle, AlertCircle } from "lucide-react";
import { type Observacion } from "../tipos/usuario";
import { estadoConfig } from "../tipos/estadoObservacion";
import { cn } from "../lib/utilidades";

interface Props {
  observaciones: Observacion[];
}

const iconos = {
  clock: Clock,
  eye: Eye,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  'alert-circle': AlertCircle,
};

const ChecklistObservaciones: React.FC<Props> = ({ observaciones }) => {
  const total = observaciones.length;

  const por_estado = {
    pendiente: observaciones.filter((o) => o.estado === "pendiente").length,
    en_revision: observaciones.filter((o) => o.estado === "en_revision").length,
    corregido: observaciones.filter((o) => o.estado === "corregido").length,
    aprobado: observaciones.filter((o) => o.estado === "aprobado").length,
    rechazado: observaciones.filter((o) => o.estado === "rechazado").length,
  };

  const completadas = por_estado.aprobado;
  const porcentaje_completado = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const pendientes_atencion = por_estado.pendiente + por_estado.rechazado;
  const en_proceso = por_estado.en_revision + por_estado.corregido;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="h-5 w-5" />
          Checklist de Observaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progreso General</span>
            <span className="text-sm text-muted-foreground">
              {completadas} de {total} completadas
            </span>
          </div>
          <Progress value={porcentaje_completado} className="h-2" />
          <span className="text-xs text-muted-foreground mt-1 block">
            {porcentaje_completado}%
          </span>
        </div>

        {total === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sin Observaciones</AlertTitle>
            <AlertDescription>
              No tienes observaciones registradas todavía.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {pendientes_atencion > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Requieren tu atención</p>
                  <p className="text-sm text-muted-foreground">
                    Observaciones pendientes o rechazadas
                  </p>
                </div>
                <Badge variant="destructive" className="text-base">
                  {pendientes_atencion}
                </Badge>
              </div>
            )}

            {en_proceso > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Eye className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">En proceso de revisión</p>
                  <p className="text-sm text-muted-foreground">
                    Observaciones en revisión o ya corregidas
                  </p>
                </div>
                <Badge className="text-base bg-blue-500 hover:bg-blue-500/80">
                  {en_proceso}
                </Badge>
              </div>
            )}

            {completadas > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Completadas y aprobadas</p>
                  <p className="text-sm text-muted-foreground">
                    Observaciones superadas exitosamente
                  </p>
                </div>
                <Badge className="text-base bg-green-500 hover:bg-green-500/80">
                  {completadas}
                </Badge>
              </div>
            )}

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <h6 className="text-sm font-medium mb-3">Resumen por Estado</h6>
              <div className="flex flex-wrap gap-2">
                {Object.entries(por_estado).map(([estado, cantidad]) => {
                  if (cantidad === 0) return null;
                  const config =
                    estadoConfig[estado as keyof typeof estadoConfig];
                  const Icono =
                    iconos[config?.icon as keyof typeof iconos] || Clock;

                  return (
                    <Badge
                      key={estado}
                      variant="outline"
                      className={cn("flex items-center gap-1.5", config?.className)}
                    >
                      <Icono className="h-3 w-3" />
                      {config?.label}: {cantidad}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChecklistObservaciones;