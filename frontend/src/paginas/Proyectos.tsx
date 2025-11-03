import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, FileUp, Info, Loader2 } from 'lucide-react';
import { useAutenticacion } from '../contextos/autenticacion-contexto';
import { proyectosApi } from '../servicios/api';
import { type Proyecto, Rol } from '../tipos/usuario';
import BarraLateral from '../componentes/BarraLateral';
import BarraLateralAdmin from '../componentes/BarraLateralAdmin';
import { cn } from '../lib/utilidades';
import { Card, CardContent } from '../componentes/ui/card';
import { Button } from '../componentes/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../componentes/ui/table';
import { Badge } from '../componentes/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../componentes/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../componentes/ui/dialog';
import { Input } from '../componentes/ui/input';
import { Label } from '../componentes/ui/label';

const Proyectos = () => {
  const [proyectos, set_proyectos] = useState<Proyecto[]>([]);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  const [mostrar_modal, set_mostrar_modal] = useState(false);
  const [nuevo_proyecto, set_nuevo_proyecto] = useState({
    titulo: '',
  });

  const { usuario } = useAutenticacion();
  const navigate = useNavigate();
  const [sidebar_open, set_sidebar_open] = useState(true);

  const es_estudiante = usuario?.rol === Rol.Estudiante;
  const es_admin = usuario?.rol === Rol.Administrador;
  const tiene_grupo = !!(es_estudiante && usuario?.perfil?.grupo);
  const grupo = usuario?.perfil?.grupo;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarProyectos = async () => {
    try {
      set_cargando(true);
      const data = await proyectosApi.obtenerTodos();
      set_proyectos(data);
    } catch (err: any) {
      set_error('Error al cargar los proyectos');
    } finally {
      set_cargando(false);
    }
  };

  const manejarCrearProyecto = async () => {
    if (!nuevo_proyecto.titulo) {
      set_error('El título del proyecto es obligatorio');
      return;
    }

    if (!tiene_grupo || !grupo?.asesor) {
      set_error('Debes estar inscrito en un grupo con un asesor asignado para crear un proyecto');
      return;
    }

    try {
      await proyectosApi.crear(nuevo_proyecto);
      set_mostrar_modal(false);
      await cargarProyectos();
      set_nuevo_proyecto({ titulo: '' });
    } catch (err: any) {
      set_error(err.response?.data?.message || 'Error al crear el proyecto');
    }
  };

  const abrirModalCrear = () => {
    if (!tiene_grupo || !grupo?.asesor) {
      set_error('Debes inscribirte a un grupo con un asesor asignado antes de crear un proyecto');
      return;
    }
    set_error('');
    set_nuevo_proyecto({ titulo: '' });
    set_mostrar_modal(true);
  };

  let contenido_pagina;

  if (cargando) {
    contenido_pagina = (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  } else {
    contenido_pagina = (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {es_estudiante ? 'Mis Proyectos' : 'Proyectos Asignados'}
          </h1>
          {es_estudiante && (
            <Button
              onClick={abrirModalCrear}
              disabled={!tiene_grupo || !grupo?.asesor}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Proyecto
            </Button>
          )}
        </div>

        {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

        {es_estudiante && (!tiene_grupo || !grupo?.asesor) && (
          <Alert variant="default" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Información</AlertTitle>
            <AlertDescription>
              Para crear proyectos, primero debes inscribirte a un grupo que tenga un asesor asignado.
              <Button
                variant="link"
                className="p-0 h-auto ml-2"
                onClick={() => navigate('/panel/inscripcion-grupos')}
              >
                Ir a Inscripción de Grupos
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {proyectos.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                {es_estudiante ? 'No tienes proyectos registrados' : 'No tienes proyectos asignados'}
              </p>
              {es_estudiante && tiene_grupo && grupo?.asesor && (
                <Button onClick={abrirModalCrear}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear mi primer proyecto
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Asesor</TableHead>
                    <TableHead>Documentos</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proyectos.map((proyecto) => (
                    <TableRow key={proyecto.id}>
                      <TableCell className="font-medium">{proyecto.titulo}</TableCell>
                      <TableCell>
                        {proyecto.estudiante?.nombre} {proyecto.estudiante?.apellido}
                      </TableCell>
                      <TableCell>
                        {proyecto.asesor?.nombre} {proyecto.asesor?.apellido}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{proyecto.documentos?.length || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(proyecto.fecha_creacion).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/panel/proyecto/${proyecto.id}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Ver
                        </Button>
                        {es_estudiante && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/panel/proyecto/${proyecto.id}`)}
                          >
                            <FileUp className="mr-1 h-4 w-4" />
                            Subir
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={mostrar_modal} onOpenChange={set_mostrar_modal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {tiene_grupo && grupo && grupo.asesor && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Asesor Asignado</AlertTitle>
                  <AlertDescription>
                    {grupo.asesor.nombre} {grupo.asesor.apellido} será asignado
                    automáticamente a este proyecto.
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="titulo">Título del Proyecto</Label>
                <Input
                  id="titulo"
                  value={nuevo_proyecto.titulo}
                  onChange={(e) => set_nuevo_proyecto({ titulo: e.target.value })}
                  placeholder="Ingrese el título del proyecto"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={manejarCrearProyecto}>
                Crear Proyecto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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

export default Proyectos;