import { useState, useEffect } from 'react';
import {
  UserPlus,
  UserMinus,
  Users,
  Briefcase,
  Calendar,
  User,
  Loader2,
} from 'lucide-react';
import { gruposApi } from '../../servicios/api';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { type Grupo, Rol } from '../../tipos/usuario';
import { toast } from 'sonner';
import Cabecera from '../../componentes/Cabecera';
import BarraLateral from '../../componentes/BarraLateral';
import BarraLateralAdmin from '../../componentes/BarraLateralAdmin';
import { cn } from '../../lib/utilidades';
import { Card, CardContent, CardHeader, CardTitle } from '../../componentes/ui/card';
import { Button } from '../../componentes/ui/button';
import { Badge } from '../../componentes/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../componentes/ui/table';
import { Separator } from '../../componentes/ui/separator';

const InscripcionGrupos = () => {
  const [grupos, set_grupos] = useState<Grupo[]>([]);
  const [mi_grupo, set_mi_grupo] = useState<Grupo | null>(null);
  const [cargando, set_cargando] = useState(true);
  const [procesando, set_procesando] = useState(false);
  const [error, set_error] = useState('');
  const { usuario, actualizarUsuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);

  const es_admin = usuario?.rol === Rol.Administrador;
  const mi_id_estudiante = usuario?.perfil?.id_estudiante;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      set_cargando(true);
      const [grupo_actual, grupos_disponibles] = await Promise.all([
        gruposApi.obtenerMiGrupo(),
        gruposApi.obtenerDisponibles(),
      ]);
      set_mi_grupo(grupo_actual);
      set_grupos(grupos_disponibles);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      set_error('Error al cargar los grupos disponibles');
    } finally {
      set_cargando(false);
    }
  };

  const manejarInscripcion = async (grupo_id: number) => {
    if (procesando) return;
    set_procesando(true);
    try {
      const respuesta = await gruposApi.inscribirseAGrupo(grupo_id);
      toast.success('¡Te has inscrito exitosamente al grupo!');
      if (respuesta.usuario_actualizado) {
        actualizarUsuario(respuesta.usuario_actualizado);
      }
      await cargarDatos();
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al inscribirse al grupo';
      toast.error(mensaje);
    } finally {
      set_procesando(false);
    }
  };

  const manejarDesinscripcion = async () => {
    if (!mi_grupo || procesando) return;
    if (!window.confirm('¿Estás seguro de que deseas desinscribirte de este grupo?')) {
      return;
    }
    set_procesando(true);
    try {
      const respuesta = await gruposApi.desinscribirseDeGrupo(mi_grupo.id);
      toast.success('Te has desinscrito exitosamente del grupo.');
      if (respuesta.usuario_actualizado) {
        actualizarUsuario(respuesta.usuario_actualizado);
      }
      await cargarDatos();
    } catch (err: any) {
      const mensaje = err.response?.data?.message || 'Error al desinscribirse del grupo';
      toast.error(mensaje);
    } finally {
      set_procesando(false);
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
  } else if (mi_grupo) {
    contenido_pagina = (
      <Card className="border-primary border-2">
        <CardHeader className="bg-primary/10">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5" />
              {mi_grupo.nombre}
            </CardTitle>
            <Badge variant="default" className="text-base">
              <User className="mr-1 h-4 w-4" />
              {mi_grupo.estudiantes?.length || 0} estudiantes
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              {mi_grupo.descripcion && (
                <div>
                  <h6 className="font-semibold">Descripción:</h6>
                  <p className="text-muted-foreground">{mi_grupo.descripcion}</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="font-medium">Asesor:</span>
                <span className="text-muted-foreground">
                  {mi_grupo.asesor?.nombre} {mi_grupo.asesor?.apellido}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">Período:</span>
                <span className="text-muted-foreground">{mi_grupo.periodo?.nombre}</span>
              </div>
              {mi_grupo.periodo && (
                <div className="text-xs text-muted-foreground">
                  <p>
                    Inscripciones:
                    {new Date(mi_grupo.periodo.fecha_inicio_inscripciones).toLocaleDateString()} -
                    {new Date(mi_grupo.periodo.fecha_fin_inscripciones).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <Button
                variant="destructive"
                size="lg"
                onClick={manejarDesinscripcion}
                disabled={procesando}
              >
                <UserMinus className="mr-2 h-4 w-4" />
                {procesando ? 'Procesando...' : 'Desinscribirme del Grupo'}
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          <h5 className="font-semibold mb-3">
            Estudiantes Inscritos ({mi_grupo.estudiantes?.length || 0})
          </h5>
          {mi_grupo.estudiantes && mi_grupo.estudiantes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mi_grupo.estudiantes.map((estudiante: any, index: number) => {
                  const es_yo = estudiante.id === mi_id_estudiante;
                  return (
                    <TableRow key={estudiante.id} className={cn(es_yo && 'bg-primary/10')}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {estudiante.nombre} {estudiante.apellido}
                        {es_yo && (
                          <Badge variant="default" className="ml-2">Tú</Badge>
                        )}
                      </TableCell>
                      <TableCell>{estudiante.usuario?.correo || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="default">Inscrito</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Alert>
              <AlertDescription>
                Aún no hay estudiantes inscritos en este grupo.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  } else {
    contenido_pagina = (
      <>
        <Alert className="mb-4">
          <AlertTitle>Información</AlertTitle>
          <AlertDescription>
            Selecciona un grupo de asesoría para recibir orientación personalizada.
            Una vez inscrito, podrás ver a tus compañeros de grupo.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.map((grupo) => (
            <Card key={grupo.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{grupo.nombre}</CardTitle>
                {grupo.descripcion && (
                  <p className="text-sm text-muted-foreground">{grupo.descripcion}</p>
                )}
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Asesor:</span>
                  <span className="text-sm text-muted-foreground">
                    {grupo.asesor?.nombre} {grupo.asesor?.apellido}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Período:</span>
                  <span className="text-sm text-muted-foreground">{grupo.periodo?.nombre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Inscritos:</span>
                  <Badge variant="secondary">{(grupo as any).numero_estudiantes || 0}</Badge>
                </div>
                <div className="flex-1" />
                <Button
                  className="w-full mt-4"
                  onClick={() => manejarInscripcion(grupo.id)}
                  disabled={procesando}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {procesando ? 'Procesando...' : 'Inscribirme'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {grupos.length === 0 && (
          <Card>
            <CardContent className="text-center py-10">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No hay grupos disponibles para inscripción en este momento.
              </p>
            </CardContent>
          </Card>
        )}
      </>
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
          <h1 className="text-3xl font-bold tracking-tight mb-6">
            {mi_grupo ? 'Mi Grupo de Asesoría' : 'Inscripción a Grupos'}
          </h1>
          {contenido_pagina}
        </div>
      </main>
    </div>
  );
};

export default InscripcionGrupos;