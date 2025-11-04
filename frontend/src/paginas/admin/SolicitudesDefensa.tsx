import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, User, FileText, Calendar, Eye } from 'lucide-react';
import { proyectosApi, documentosApi } from '../../servicios/api';
import { type Proyecto, Rol, type Asesor } from '../../tipos/usuario';
import { toast } from 'sonner';
import { cn } from '../../lib/utilidades';
import BarraLateralAdmin from '../../componentes/barra-lateral-admin';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Button } from '../../componentes/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../componentes/ui/card';
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
import BarraLateral from '../../componentes/barra-lateral';

const SolicitudesDefensa = () => {
  const [solicitudes, set_solicitudes] = useState<Proyecto[]>([]);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  
  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);
  const es_admin = usuario?.rol === Rol.Administrador;
  const navigate = useNavigate();

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      set_cargando(true);
      const data = await proyectosApi.obtenerSolicitudesDefensa();
      set_solicitudes(data);
    } catch (err: any) {
      set_error(err.response?.data?.message || 'Error al cargar las solicitudes de defensa');
    } finally {
      set_cargando(false);
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
                <TableHead>ID Proyecto</TableHead>
                <TableHead>Título del Proyecto</TableHead>
                <TableHead>Estudiante(s)</TableHead>
                <TableHead>Asesor</TableHead>
                <TableHead>Memorial</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.map((proyecto) => (
                <TableRow key={proyecto.id}>
                  <TableCell>{proyecto.id}</TableCell>
                  <TableCell className="font-medium">{proyecto.titulo}</TableCell>
                  <TableCell>
                    {proyecto.estudiantes?.map(e => `${e.nombre} ${e.apellido}`).join(', ') || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {proyecto.asesor ? `${proyecto.asesor.nombre} ${proyecto.asesor.apellido}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {proyecto.ruta_memorial ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={documentosApi.obtenerArchivoPorRutaUrl(proyecto.ruta_memorial)} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-1" /> Ver PDF
                        </a>
                      </Button>
                    ) : (
                      <Badge variant="destructive">Sin Memorial</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/panel/proyecto/${proyecto.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> Responder
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {solicitudes.length === 0 && (
            <p className="text-muted-foreground text-center py-10">
              No hay solicitudes de defensa pendientes.
            </p>
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
          <h1 className="text-3xl font-bold tracking-tight mb-6">Solicitudes de Defensa</h1>
          {contenido_pagina}
        </div>
      </main>
    </div>
  );
};

export default SolicitudesDefensa;