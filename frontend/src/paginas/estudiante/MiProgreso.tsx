import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { proyectosApi } from '../../servicios/api';
import { type TimelineCompletoDto, type Tribunal } from '../../tipos/usuario';
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

const MiProgreso = () => {
  const [timeline, set_timeline] = useState<TimelineCompletoDto | null>(null);
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
        
        <TabsContent value="defensa" className="mt-6">
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