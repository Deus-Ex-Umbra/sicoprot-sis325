import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2 } from 'lucide-react';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { proyectosApi } from '../../servicios/api';
import { type Proyecto, Rol } from '../../tipos/usuario';
import Cabecera from '../../componentes/Cabecera';
import BarraLateral from '../../componentes/BarraLateral';
import BarraLateralAdmin from '../../componentes/BarraLateralAdmin';
import { cn } from '../../lib/utilidades';
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
import { Button } from '../../componentes/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';

const MisEstudiantes = () => {
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
    cargarProyectos();
  }, []);

  const cargarProyectos = async () => {
    try {
      const data = await proyectosApi.obtenerTodos();
      set_proyectos(data);
    } catch (err) {
      set_error('No se pudo cargar la lista de estudiantes.');
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
    contenido_pagina = (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  } else {
    contenido_pagina = (
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Documentos</TableHead>
                <TableHead>Fecha de Inicio</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proyectos.map((proyecto) => (
                <TableRow key={proyecto.id}>
                  <TableCell className="font-medium">
                    {proyecto.estudiante?.nombre} {proyecto.estudiante?.apellido}
                  </TableCell>
                  <TableCell>{proyecto.titulo}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {proyecto.documentos?.length || 0} documento(s)
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(proyecto.fecha_creacion).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/panel/proyecto/${proyecto.id}`)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ver Proyecto
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {proyectos.length === 0 && (
            <p className="text-muted-foreground text-center py-10">
              No tienes estudiantes asignados.
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
          <h1 className="text-3xl font-bold tracking-tight mb-6">Mis Estudiantes</h1>
          {contenido_pagina}
        </div>
      </main>
    </div>
  );
};

export default MisEstudiantes;