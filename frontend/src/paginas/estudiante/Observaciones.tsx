import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { observacionesApi } from '../../servicios/api';
import type { Observacion } from '../../tipos/observacion';
import BarraLateral from '../../componentes/BarraLateral';
import BarraLateralAdmin from '../../componentes/BarraLateralAdmin';
import { cn } from '../../lib/utilidades';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Rol } from '../../tipos/usuario';
import { Card, CardContent, CardHeader, CardTitle } from '../../componentes/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';
import { Badge } from '../../componentes/ui/badge';
import { Progress } from '../../componentes/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../componentes/ui/table';

const Observaciones = () => {
  const [observaciones, set_observaciones] = useState<Observacion[]>([]);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);

  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await observacionesApi.obtenerPorEstudiante();
        set_observaciones(data);
      } catch (err) {
        set_error('Error al cargar observaciones');
      } finally {
        set_cargando(false);
      }
    };
    cargar();
  }, []);

  const total_observaciones = observaciones.length;
  const corregidas = observaciones.filter(o => o.estado === 'CORREGIDO').length;
  const pendientes = observaciones.filter(o => o.estado === 'PENDIENTE').length;
  const rechazadas = observaciones.filter(o => o.estado === 'RECHAZADO').length;
  const porcentaje_completado = total_observaciones > 0
    ? Math.round((corregidas / total_observaciones) * 100)
    : 0;

  const obtenerVarianteBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'secondary';
      case 'CORREGIDO':
        return 'default';
      case 'RECHAZADO':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const obtenerIcono = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return '⏳';
      case 'CORREGIDO': return '✅';
      case 'RECHAZADO': return '❌';
      default: return '❓';
    }
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
  } else {
    contenido_pagina = (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
              <div>
                <p className="text-3xl font-bold text-yellow-500">{pendientes}</p>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-500">{corregidas}</p>
                <p className="text-sm text-muted-foreground">Corregidas</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-500">{rechazadas}</p>
                <p className="text-sm text-muted-foreground">Rechazadas</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{total_observaciones}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progreso de correcciones</span>
                <span className="text-sm font-bold">{porcentaje_completado}%</span>
              </div>
              <Progress value={porcentaje_completado} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mis Observaciones Recibidas</CardTitle>
          </CardHeader>
          <CardContent>
            {observaciones.length === 0 ? (
              <Alert>
                <AlertTitle>¡Excelente!</AlertTitle>
                <AlertDescription>
                  No tienes observaciones pendientes.
                </AlertDescription>
              </Alert>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Asesor</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Observación</TableHead>
                    <TableHead>Página</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {observaciones.map((obs) => {
                    const proyecto = obs.documento?.proyecto;
                    const asesor = obs.autor;
                    const nombre_asesor = asesor
                      ? `${asesor.nombre} ${asesor.apellido}`
                      : '—';
                    const titulo_proyecto = proyecto?.titulo || 'Sin proyecto';
                    const nombre_documento = obs.documento?.nombre_archivo || 'Sin documento';

                    return (
                      <TableRow key={obs.id}>
                        <TableCell>{obs.id}</TableCell>
                        <TableCell className="font-medium">{titulo_proyecto}</TableCell>
                        <TableCell>{nombre_asesor}</TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{nombre_documento}</span>
                          <br />
                          <Badge variant="outline" className="mt-1">
                            v{obs.documento?.version || 1}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{obs.titulo || 'Sin título'}</p>
                          <p className="text-xs text-muted-foreground">
                            {obs.descripcion_corta || obs.contenido_detallado?.substring(0, 50) + '...'}
                          </p>
                        </TableCell>
                        <TableCell className="text-center">{obs.pagina_inicio}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={obtenerVarianteBadge(obs.estado)}>
                            {obtenerIcono(obs.estado)} {obs.estado}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
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
          {contenido_pagina}
        </div>
      </main>
    </div>
  );
};

export default Observaciones;