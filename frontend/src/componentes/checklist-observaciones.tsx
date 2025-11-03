import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CheckCircle, Clock, Eye, XCircle, AlertCircle, GitPullRequestArrow, History } from "lucide-react";
import { type Observacion, type Correccion } from "../tipos/usuario";
import { estadoConfig } from "../tipos/estadoObservacion";
import { cn } from "../lib/utilidades";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Separator } from "./ui/separator";

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

const RenderCorreccion = ({ correccion }: { correccion: Correccion }) => {
  const estado_badge = () => {
    switch (correccion.estado) {
      case 'ACEPTADA':
        return <Badge variant="default" className="bg-green-600">Aceptada</Badge>;
      case 'RECHAZADA':
        return <Badge variant="destructive">Rechazada</Badge>;
      case 'PENDIENTE_REVISION':
      default:
        return <Badge variant="secondary">Pendiente de Revisión</Badge>;
    }
  };

  return (
    <div className="p-3 bg-muted/50 rounded-md">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <GitPullRequestArrow className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Corrección (v{correccion.version_corregida})</span>
        </div>
        {estado_badge()}
      </div>
      <p className="text-xs text-muted-foreground mb-1">
        Enviada el: {new Date(correccion.fecha_creacion).toLocaleString()}
      </p>
      <div
        className="text-sm prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: correccion.descripcion_html }}
      />
    </div>
  );
};

const ChecklistObservaciones: React.FC<Props> = ({ observaciones }) => {
  const total = observaciones.length;

  const por_estado = {
    pendiente: observaciones.filter((o) => o.estado === "pendiente").length,
    en_revision: observaciones.filter((o) => o.estado === "en_revision").length,
    corregido: observaciones.filter((o) => o.estado === "corregida").length,
    rechazado: observaciones.filter((o) => o.estado === "rechazado").length,
  };
  
  const completadas = por_estado.corregido;
  const porcentaje_completado = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const pendientes_atencion = por_estado.pendiente + por_estado.rechazado;
  const en_proceso = por_estado.en_revision;

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
                    Observaciones en revisión
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
                  <p className="font-medium">Completadas y Corregidas</p>
                  <p className="text-sm text-muted-foreground">
                    Observaciones superadas exitosamente
                  </p>
                </div>
                <Badge className="text-base bg-green-500 hover:bg-green-500/80">
                  {completadas}
                </Badge>
              </div>
            )}

            <Separator />
            
            <Accordion type="multiple" className="w-full">
              {observaciones.map((obs) => {
                const config = estadoConfig[obs.estado as keyof typeof estadoConfig];
                const Icono = iconos[config?.icon as keyof typeof iconos] || Clock;
                
                return (
                  <AccordionItem value={`obs-${obs.id}`} key={obs.id}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                         <Badge
                            variant="outline"
                            className={cn("flex items-center gap-1.5", config?.className)}
                          >
                            <Icono className="h-3 w-3" />
                            {config?.label}
                          </Badge>
                        <span className="text-left">{obs.titulo}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div
                        className="prose prose-sm max-w-none text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: obs.contenido_html }}
                      />
                      {obs.comentarios_asesor_html && (
                        <Alert>
                          <AlertTitle>Comentario del Asesor</AlertTitle>
                          <AlertDescription
                            dangerouslySetInnerHTML={{ __html: obs.comentarios_asesor_html }}
                          />
                        </Alert>
                      )}
                      
                      {obs.correcciones && obs.correcciones.length > 0 && (
                        <div className="space-y-3">
                           <div className="flex items-center gap-2 text-sm font-medium">
                              <History className="h-4 w-4" />
                              Historial de Correcciones
                           </div>
                           <div className="space-y-2 pl-6 border-l-2 border-primary/50">
                            {obs.correcciones.sort((a, b) => new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime()).map(corr => (
                              <RenderCorreccion correccion={corr} key={corr.id} />
                            ))}
                           </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>

          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChecklistObservaciones;