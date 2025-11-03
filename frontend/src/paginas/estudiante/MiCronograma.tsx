import { useState, useEffect } from 'react';
import { Loader2, Calendar, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { proyectosApi } from '../../servicios/api';
import { type CronogramaProyectoDto, EtapaProyecto, type EtapaCronograma } from '../../tipos/usuario';
import BarraLateral from '../../componentes/barra-lateral';
import BarraLateralAdmin from '../../componentes/barra-lateral-admin';
import { cn } from '../../lib/utilidades';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Rol } from '../../tipos/usuario';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../componentes/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';
import { Badge } from '../../componentes/ui/badge';
import { Separator } from '../../componentes/ui/separator';

const MiCronograma = () => {
  const [cronograma, set_cronograma] = useState<CronogramaProyectoDto | null>(null);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);

  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    const cargarCronograma = async () => {
      try {
        const data = await proyectosApi.obtenerCronogramaProyecto();
        set_cronograma(data);
      } catch (err: any) {
        set_error(err.response?.data?.message || 'Error al cargar el cronograma');
      } finally {
        set_cargando(false);
      }
    };
    cargarCronograma();
  }, []);

  const EtapaCard = ({ etapa }: { etapa: EtapaCronograma }) => {
    const getIcono = () => {
      switch (etapa.estado) {
        case 'aprobado':
          return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'vencido':
          return <XCircle className="h-5 w-5 text-destructive" />;
        case 'pendiente':
        default:
          return <Clock className="h-5 w-5 text-yellow-500" />;
      }
    };

    const getDiasRestantesColor = () => {
      if (etapa.estado === 'vencido') return 'text-destructive';
      if (etapa.dias_restantes !== null && etapa.dias_restantes <= 7) return 'text-destructive';
      if (etapa.dias_restantes !== null && etapa.dias_restantes <= 30) return 'text-yellow-600';
      return 'text-green-600';
    };
    
    const esEtapaActual = cronograma?.etapa_actual === etapa.nombre;

    return (
      <Card className={cn(esEtapaActual && 'border-primary border-2 shadow-lg')}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl capitalize">{etapa.nombre}</CardTitle>
            {getIcono()}
          </div>
          <CardDescription>
            <Badge variant={etapa.estado === 'aprobado' ? 'default' : 'secondary'}>
              {etapa.estado}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Fecha Límite:</span>
              <span className="font-medium">
                {etapa.fecha_limite_entrega
                  ? new Date(etapa.fecha_limite_entrega).toLocaleDateString()
                  : 'No definida'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Días Restantes:</span>
              <span className={cn("font-bold text-lg", getDiasRestantesColor())}>
                {etapa.estado === 'aprobado' ? '✓' : 
                 etapa.estado === 'vencido' ? 'Vencido' :
                 etapa.dias_restantes !== null ? `${etapa.dias_restantes}` : 'N/A'}
              </span>
            </div>
          </div>
          
          {esEtapaActual && etapa.recomendaciones.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Recomendaciones</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside text-xs space-y-1">
                  {etapa.recomendaciones.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

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
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  } else if (!cronograma) {
    contenido_pagina = (
      <Alert>
        <AlertTitle>Información</AlertTitle>
        <AlertDescription>
          No se encontró un cronograma. Asegúrate de estar inscrito en un grupo activo
          y tener un proyecto asignado.
        </AlertDescription>
      </Alert>
    );
  } else {
    contenido_pagina = (
      <div className="space-y-6">
        <Card className="bg-muted/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Período Académico: {cronograma.periodo.nombre}</CardTitle>
                <CardDescription>
                  Del {new Date(cronograma.periodo.fecha_inicio).toLocaleDateString()} al {new Date(cronograma.periodo.fecha_fin).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cronograma.etapas.map((etapa: EtapaCronograma) => (
            <EtapaCard key={etapa.nombre} etapa={etapa} />
          ))}
        </div>
      </div>
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
          <h1 className="text-3xl font-bold tracking-tight mb-6">Mi Cronograma</h1>
          {contenido_pagina}
        </div>
      </main>
    </div>
  );
};

export default MiCronograma;