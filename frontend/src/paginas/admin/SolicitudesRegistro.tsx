import { useState, useEffect } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { solicitudesRegistroApi } from '../../servicios/api';
import { type SolicitudRegistro, Rol } from '../../tipos/usuario';
import { toast } from 'sonner';
import { cn } from '../../lib/utilidades';
import Cabecera from '../../componentes/Cabecera';
import BarraLateralAdmin from '../../componentes/BarraLateralAdmin';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Button } from '../../componentes/ui/button';
import { Card, CardContent } from '../../componentes/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../componentes/ui/table';
import { Badge } from '../../componentes/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../../componentes/ui/dialog';
import { Label } from '../../componentes/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';
import { Textarea } from '../../componentes/ui/textarea';
import BarraLateral from '../../componentes/BarraLateral';

const SolicitudesRegistro = () => {
  const [solicitudes, set_solicitudes] = useState<SolicitudRegistro[]>([]);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  const [mostrar_modal, set_mostrar_modal] = useState(false);
  const [solicitud_seleccionada, set_solicitud_seleccionada] = useState<SolicitudRegistro | null>(null);
  const [respuesta, set_respuesta] = useState<'aprobada' | 'rechazada'>('aprobada');
  const [comentarios, set_comentarios] = useState('');

  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);
  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const data = await solicitudesRegistroApi.obtenerPendientes();
      set_solicitudes(data);
    } catch (err) {
      set_error('Error al cargar las solicitudes');
    } finally {
      set_cargando(false);
    }
  };

  const abrirModalResponder = (solicitud: SolicitudRegistro, tipo: 'aprobada' | 'rechazada') => {
    set_solicitud_seleccionada(solicitud);
    set_respuesta(tipo);
    set_comentarios('');
    set_mostrar_modal(true);
  };

  const manejarResponder = async () => {
    if (!solicitud_seleccionada) return;

    try {
      await solicitudesRegistroApi.responder(solicitud_seleccionada.id, {
        estado: respuesta,
        comentarios_admin: comentarios || undefined,
      });
      
      toast.success(`Solicitud ${respuesta === 'aprobada' ? 'aprobada' : 'rechazada'} exitosamente`);
      set_mostrar_modal(false);
      await cargarSolicitudes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al procesar solicitud');
    }
  };

  const obtenerBadgeRol = (rol: Rol) => {
    switch (rol) {
      case Rol.Estudiante:
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Estudiante</Badge>;
      case Rol.Asesor:
        return <Badge variant="outline" className="text-cyan-500 border-cyan-500">Asesor</Badge>;
      default:
        return <Badge variant="secondary">{rol}</Badge>;
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
    contenido_pagina = <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
  } else {
    contenido_pagina = (
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol Solicitado</TableHead>
                <TableHead>Fecha Solicitud</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.map((solicitud) => (
                <TableRow key={solicitud.id}>
                  <TableCell>{solicitud.id}</TableCell>
                  <TableCell>{solicitud.nombre} {solicitud.apellido}</TableCell>
                  <TableCell>{solicitud.correo}</TableCell>
                  <TableCell>{obtenerBadgeRol(solicitud.rol)}</TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-xs">
                      {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => abrirModalResponder(solicitud, 'aprobada')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" /> Aprobar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => abrirModalResponder(solicitud, 'rechazada')}
                      >
                        <X className="h-4 w-4 mr-1" /> Rechazar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {solicitudes.length === 0 && (
            <p className="text-muted-foreground text-center py-10">
              No hay solicitudes pendientes.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Cabecera toggleSidebar={toggleSidebar} />
      {es_admin ? (
        <BarraLateralAdmin isOpen={sidebar_open} />
      ) : (
        <BarraLateral isOpen={sidebar_open} />
      )}

      <main
        className={cn(
          'transition-all duration-300 pt-14',
          sidebar_open ? 'ml-64' : 'ml-0'
        )}
      >
        <div className="container mx-auto p-6 max-w-7xl">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Solicitudes de Registro Pendientes</h1>
          {contenido_pagina}

          <Dialog open={mostrar_modal} onOpenChange={set_mostrar_modal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {respuesta === 'aprobada' ? 'Aprobar' : 'Rechazar'} Solicitud
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {solicitud_seleccionada && (
                  <>
                    <p>
                      <strong>Solicitante:</strong> {solicitud_seleccionada.nombre} {solicitud_seleccionada.apellido}
                    </p>
                    <p>
                      <strong>Correo:</strong> {solicitud_seleccionada.correo}
                    </p>
                    <div className="flex items-center gap-2">
                      <strong>Rol solicitado:</strong> {obtenerBadgeRol(solicitud_seleccionada.rol)}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comentarios">
                        Comentarios {respuesta === 'rechazada' ? '(recomendado)' : '(opcional)'}
                      </Label>
                      <Textarea
                        id="comentarios"
                        value={comentarios}
                        onChange={(e) => set_comentarios(e.target.value)}
                        placeholder={
                          respuesta === 'rechazada' 
                            ? 'Explica el motivo del rechazo...'
                            : 'Mensaje de bienvenida opcional...'
                        }
                      />
                    </div>

                    <Alert variant={respuesta === 'aprobada' ? 'default' : 'destructive'}>
                      <AlertDescription>
                        {respuesta === 'aprobada' 
                          ? '✓ Se creará una cuenta activa para este usuario.'
                          : '⚠ La solicitud será rechazada y el usuario será notificado.'
                        }
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  variant={respuesta === 'aprobada' ? 'default' : 'destructive'} 
                  onClick={manejarResponder}
                >
                  Confirmar {respuesta === 'aprobada' ? 'Aprobación' : 'Rechazo'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default SolicitudesRegistro;