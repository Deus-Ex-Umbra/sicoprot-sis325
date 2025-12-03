import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { proyectosApi, defensasApi } from '../../servicios/api';
import { type TimelineCompletoDto, type Tribunal, ResultadoDefensa } from '../../tipos/usuario';
import BarraLateral from '../../componentes/barra-lateral';
import BarraLateralAdmin from '../../componentes/barra-lateral-admin';
import { cn } from '../../lib/utilidades';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Rol } from '../../tipos/usuario';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../componentes/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../componentes/ui/tabs';
import LineaTiempo from '../../componentes/linea-tiempo';
import { Badge } from '../../componentes/ui/badge';
import { Separator } from '../../componentes/ui/separator';

interface ObservacionPreDefensa {
  id: number;
  fecha_programada: string;
  resultado: string;
  nota_promedio: number;
  intento_numero: number;
  observaciones: { asesor: string; observacion: string }[];
}

const MiProgreso = () => {
  const [timeline, set_timeline] = useState<TimelineCompletoDto | null>(null);
  const [observaciones_predefensa, set_observaciones_predefensa] = useState<ObservacionPreDefensa[]>([]);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);

  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    const cargarTimeline = async () => {
      try {
        const data = await proyectosApi.obtenerTimelineCompleto();
        set_timeline(data);
        
        // Cargar observaciones de pre-defensa si el proyecto tiene ID
        if (data?.proyecto?.id) {
          try {
            const obs = await defensasApi.obtenerObservacionesPreDefensa(data.proyecto.id);
            set_observaciones_predefensa(obs);
          } catch (err) {
            // No hay observaciones o error, continuar sin ellas
            console.log('No se pudieron cargar observaciones de pre-defensa');
          }
        }
      } catch (err: any) {
        set_error(err.response?.data?.message || 'Error al cargar el progreso');
      } finally {
        set_cargando(false);
      }
    };
    cargarTimeline();
  }, []);

  const SeccionDetallada = ({ titulo, data }: { titulo: string; data: any[] }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{titulo}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay elementos.</p>
      ) : (
        <div className="space-y-3">
          {data.map((item: any, index: number) => (
            <Card key={item.id || index} className="bg-muted/50">
              <CardContent className="pt-4">
                <p className="font-medium">{item.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.fecha_creacion || item.fecha_programada || item.fecha_subida).toLocaleString()}
                </p>
                <Badge variant="secondary" className="mt-2">{item.estado || `v${item.version}`}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

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
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  } else if (!timeline) {
    contenido_pagina = (
      <Alert>
        <AlertTitle>Sin Proyecto</AlertTitle>
        <AlertDescription>
          No se encontró un proyecto para mostrar el progreso.
        </AlertDescription>
      </Alert>
    );
  } else {
    contenido_pagina = (
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Línea de Tiempo</TabsTrigger>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="proyecto">Proyecto</TabsTrigger>
          <TabsTrigger value="defensa">Defensa</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Línea de Tiempo del Proyecto</CardTitle>
              <CardDescription>
                Un historial cronológico de todos los eventos de tu proyecto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineaTiempo eventos={timeline.linea_tiempo} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="perfil" className="mt-6 space-y-6">
          <SeccionDetallada titulo="Versiones del Perfil" data={timeline.perfil.versiones} />
          <Separator />
          <SeccionDetallada titulo="Observaciones del Perfil" data={timeline.perfil.observaciones} />
        </TabsContent>
        
        <TabsContent value="proyecto" className="mt-6 space-y-6">
          <SeccionDetallada titulo="Reuniones del Proyecto" data={timeline.proyecto_desarrollo.reuniones} />
          <Separator />
          <SeccionDetallada titulo="Versiones del Proyecto" data={timeline.proyecto_desarrollo.versiones} />
          <Separator />
          <SeccionDetallada titulo="Observaciones del Proyecto" data={timeline.proyecto_desarrollo.observaciones} />
        </TabsContent>
        
        <TabsContent value="defensa" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado de la Defensa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Solicitud Enviada:</span>
                <Badge variant={timeline.defensa.solicitada ? 'default' : 'secondary'}>
                  {timeline.defensa.solicitada ? 'Sí' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Defensa Aprobada:</span>
                <Badge variant={timeline.defensa.aprobada ? 'default' : 'secondary'}>
                  {timeline.defensa.aprobada ? 'Sí' : 'No'}
                </Badge>
              </div>
              {timeline.defensa.comentarios && (
                <Alert>
                  <AlertTitle>Comentarios de Administración</AlertTitle>
                  <AlertDescription>{timeline.defensa.comentarios}</AlertDescription>
                </Alert>
              )}
              {timeline.defensa.tribunales && timeline.defensa.tribunales.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tribunales Asignados</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {timeline.defensa.tribunales.map((t: Tribunal, i: number) => (
                      <li key={i}>{t.nombre} ({t.correo})</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observaciones de Pre-Defensas */}
          {observaciones_predefensa.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Observaciones de Pre-Defensas
                </CardTitle>
                <CardDescription>
                  Comentarios y sugerencias del tribunal para mejorar tu proyecto antes de la defensa final
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {observaciones_predefensa.map((predefensa) => (
                  <div key={predefensa.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">Pre-Defensa #{predefensa.intento_numero}</h4>
                        {predefensa.resultado === ResultadoDefensa.APROBADO ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" /> Aprobada
                          </Badge>
                        ) : predefensa.resultado === ResultadoDefensa.REPROBADO ? (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" /> Reprobada
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" /> Pendiente
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(predefensa.fecha_programada).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span>Nota promedio: <strong>{predefensa.nota_promedio?.toFixed(1) || '0'}</strong> / 100</span>
                    </div>

                    {predefensa.observaciones.length > 0 ? (
                      <div className="space-y-3 mt-4">
                        <h5 className="font-medium text-sm">Observaciones del tribunal:</h5>
                        {predefensa.observaciones.map((obs, idx) => (
                          <div key={idx} className="bg-muted rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">{obs.asesor}</p>
                            <p className="text-sm whitespace-pre-wrap">{obs.observacion}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No hay observaciones registradas para esta pre-defensa.
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Mi Progreso</h1>
          <p className="text-muted-foreground mb-6">
            Historial de avances, revisiones y eventos clave de tu proyecto.
          </p>
          {contenido_pagina}
        </div>
      </main>
    </div>
  );
};

export default MiProgreso;