import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { proyectosApi } from '../../servicios/api';
import { type Proyecto, Rol } from '../../tipos/usuario';
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
import { Button } from '../../componentes/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';
import BarraLateral from '../../componentes/barra-lateral';
import BarraLateralAdmin from '../../componentes/barra-lateral-admin';
import { cn } from '../../lib/utilidades';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';

const RevisarDocumentos = () => {
  const [proyectos, set_proyectos] = useState<Proyecto[]>([]);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  const navigate = useNavigate();
  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);

  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const data = await proyectosApi.obtenerTodos();
        set_proyectos(data.filter((p: Proyecto) => p.documentos && p.documentos.length > 0));
      } catch (err) {
        set_error('No se pudo cargar la lista de documentos a revisar.');
      } finally {
        set_cargando(false);
      }
    };
    cargarProyectos();
  }, []);

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
          <CardTitle>Revisar Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>Última Versión</TableHead>
                <TableHead>Fecha de Subida</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proyectos.map((proyecto) => {
                const ultimo_documento = proyecto.documentos?.[0];
                return (
                  <TableRow key={proyecto.id}>
                    <TableCell className="font-medium">{proyecto.titulo}</TableCell>
                    <TableCell>{proyecto.estudiantes?.[0]?.nombre} {proyecto.estudiantes?.[0]?.apellido}</TableCell>
                    <TableCell>
                      <Badge variant="default">Versión {ultimo_documento?.version}</Badge>
                    </TableCell>
                    <TableCell>
                      {ultimo_documento ? new Date(ultimo_documento.fecha_subida).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/panel/proyecto/${proyecto.id}`)}
                      >
                        Revisar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {proyectos.length === 0 && (
            <p className="text-muted-foreground text-center py-10">
              No hay documentos pendientes de revisión.
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
          {contenido_pagina}
        </div>
      </main>
    </div>
  );
};

export default RevisarDocumentos;