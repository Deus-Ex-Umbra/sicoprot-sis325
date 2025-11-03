import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { observacionesApi } from '../../servicios/api';
import { type Observacion, EstadoObservacion } from '../../tipos/usuario';
import { Card, CardContent, CardHeader, CardTitle } from '../../componentes/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../componentes/ui/table';
import { Badge } from '../../componentes/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../componentes/ui/select';
import BarraLateral from '../../componentes/barra-lateral';
import BarraLateralAdmin from '../../componentes/barra-lateral-admin';
import { cn } from '../../lib/utilidades';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Rol } from '../../tipos/usuario';

const ObservacionesAsesor = () => {
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
        const data = await observacionesApi.obtenerMias();
        set_observaciones(data);
      } catch (err) {
        set_error('Error al cargar observaciones');
      } finally {
        set_cargando(false);
      }
    };
    cargar();
  }, []);

  const manejarCambioEstado = async (id: number, nuevoEstado: string) => {
    try {
      await observacionesApi.actualizar(id, { estado: nuevoEstado });
      set_observaciones(prev =>
        prev.map(obs => (obs.id === id ? { ...obs, estado: nuevoEstado as EstadoObservacion } : obs))
      );
      toast.success('Estado actualizado correctamente');
    } catch (err) {
      toast.error('Error al actualizar el estado');
    }
  };

  const obtenerVarianteBadge = (estado: string) => {
    switch (estado) {
      case EstadoObservacion.PENDIENTE:
        return 'secondary';
      case EstadoObservacion.CORREGIDA:
        return 'default';
      case EstadoObservacion.RECHAZADO:
        return 'destructive';
      case EstadoObservacion.EN_REVISION:
        return 'outline';
      default:
        return 'outline';
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
      <Card>
        <CardHeader>
          <CardTitle>Mis Observaciones a Estudiantes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Observaciones realizadas: {observaciones.length}
          </p>
        </CardHeader>
        <CardContent>
          {observaciones.length === 0 ? (
            <Alert>
              <AlertDescription>
                No has creado observaciones todavía.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Observación</TableHead>
                  <TableHead>Página</TableHead>
                  <TableHead>Estado Actual</TableHead>
                  <TableHead>Cambiar Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {observaciones.map((obs) => {
                  const proyecto = obs.documento?.proyecto;
                  const estudiante = proyecto?.estudiantes?.[0];
                  const nombre_estudiante = estudiante
                    ? `${estudiante.nombre} ${estudiante.apellido}`
                    : '—';
                  const titulo_proyecto = proyecto?.titulo || 'Sin proyecto';
                  const nombre_documento = obs.documento?.nombre_archivo || 'Sin documento';

                  return (
                    <TableRow key={obs.id}>
                      <TableCell>{obs.id}</TableCell>
                      <TableCell className="font-medium">{titulo_proyecto}</TableCell>
                      <TableCell>{nombre_estudiante}</TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{nombre_documento}</span>
                        <br />
                        <Badge variant="outline" className="mt-1">
                          v{obs.documento?.version || 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{obs.titulo || 'Sin título'}</p>
                        <p 
                          className="text-xs text-muted-foreground prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: obs.contenido_html.substring(0, 70) + '...' }}
                        />
                      </TableCell>
                      <TableCell className="text-center">{obs.pagina_inicio}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={obtenerVarianteBadge(obs.estado)}>
                          {obs.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={obs.estado}
                          onValueChange={(value) => manejarCambioEstado(obs.id, value)}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={EstadoObservacion.PENDIENTE}>⏳ Pendiente</SelectItem>
                            <SelectItem value={EstadoObservacion.EN_REVISION}>👀 En Revisión</SelectItem>
                            <SelectItem value={EstadoObservacion.CORREGIDA}>✅ Corregida</SelectItem>
                            <SelectItem value={EstadoObservacion.RECHAZADO}>❌ Rechazado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
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

export default ObservacionesAsesor;