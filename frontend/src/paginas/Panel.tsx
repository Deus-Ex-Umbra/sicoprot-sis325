import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { Rol } from '../tipos/usuario';
import { 
  FolderKanban, 
  FileText, 
  MessageSquare, 
  GraduationCap, 
  AlertCircle,
  BookOpen,
  Users,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../componentes/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../componentes/ui/alert';
import { Button } from '../componentes/ui/button';
import { Badge } from '../componentes/ui/badge';
import Cabecera from '../componentes/Cabecera';
import BarraLateral from '../componentes/BarraLateral';
import BarraLateralAdmin from '../componentes/BarraLateralAdmin';
import { cn } from '../lib/utilidades';

const Panel = () => {
  const { usuario } = useAutenticacion();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const es_estudiante = usuario?.rol === Rol.Estudiante;
  const es_asesor = usuario?.rol === Rol.Asesor;
  const es_admin = usuario?.rol === Rol.Administrador;

  const tiene_grupo = !!(es_estudiante && usuario?.perfil?.grupo);
  const grupo = usuario?.perfil?.grupo;

  if (es_admin) {
    navigate('/panel/admin');
    return null;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const tarjetas_estudiante = [
    {
      titulo: 'Mis Proyectos',
      descripcion: 'Gestiona y sube documentos',
      icono: FolderKanban,
      ruta: '/panel/proyectos',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-500'
    },
    {
      titulo: 'Mis Documentos',
      descripcion: 'Revisa tus documentos subidos',
      icono: FileText,
      ruta: '/panel/mis-documentos',
      color: 'bg-green-500/10 text-green-600 dark:text-green-500'
    },
    {
      titulo: 'Observaciones',
      descripcion: 'Ver y atender observaciones',
      icono: MessageSquare,
      ruta: '/panel/observaciones',
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-500'
    },
    {
      titulo: 'Mi Grupo',
      descripcion: 'Ver información del grupo',
      icono: Users,
      ruta: '/panel/inscripcion-grupos',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-500'
    }
  ];

  const tarjetas_asesor = [
    {
      titulo: 'Proyectos',
      descripcion: 'Ver proyectos asignados',
      icono: FolderKanban,
      ruta: '/panel/proyectos',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-500'
    },
    {
      titulo: 'Mis Estudiantes',
      descripcion: 'Gestionar estudiantes asignados',
      icono: GraduationCap,
      ruta: '/panel/estudiantes',
      color: 'bg-green-500/10 text-green-600 dark:text-green-500'
    },
    {
      titulo: 'Revisar Documentos',
      descripcion: 'Revisar y dar feedback',
      icono: BookOpen,
      ruta: '/panel/revisar',
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-500'
    },
    {
      titulo: 'Observaciones',
      descripcion: 'Gestionar observaciones',
      icono: MessageSquare,
      ruta: '/panel/gestion-observaciones',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-500'
    }
  ];

  const tarjetas = es_estudiante ? tarjetas_estudiante : tarjetas_asesor;

  return (
    <div className="min-h-screen bg-background">
      <Cabecera toggleSidebar={toggleSidebar} />
      {es_admin ? (
        <BarraLateralAdmin isOpen={sidebarOpen} />
      ) : (
        <BarraLateral isOpen={sidebarOpen} />
      )}

      <main
        className={cn(
          'transition-all duration-300 pt-14',
          sidebarOpen ? 'ml-64' : 'ml-0'
        )}
      >
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                ¡Bienvenido, {usuario?.perfil?.nombre || usuario?.correo}!
              </h1>
              <p className="text-muted-foreground">
                {es_estudiante 
                  ? 'Gestiona tus proyectos y documentos de titulación' 
                  : 'Supervisa y da seguimiento a tus estudiantes'}
              </p>
            </div>

            {es_estudiante && !tiene_grupo && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Importante: No estás inscrito en ningún grupo</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p>
                    Para crear proyectos y recibir orientación, debes inscribirte en un grupo de asesoría.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/panel/inscripcion-grupos')}
                    className="mt-2"
                  >
                    Inscribirme en un Grupo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {tiene_grupo && grupo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Tu Grupo de Asesoría
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{grupo.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        Asesor: {grupo.asesor?.nombre} {grupo.asesor?.apellido}
                      </p>
                    </div>
                    <Badge variant={grupo.activo ? 'default' : 'secondary'}>
                      {grupo.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {tarjetas.map((tarjeta, index) => {
                const Icono = tarjeta.icono;
                return (
                  <Card 
                    key={index} 
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => navigate(tarjeta.ruta)}
                  >
                    <CardHeader className="space-y-3">
                      <div className={`h-12 w-12 rounded-lg ${tarjeta.color} flex items-center justify-center`}>
                        <Icono className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {tarjeta.titulo}
                        </CardTitle>
                        <CardDescription>
                          {tarjeta.descripcion}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Acceso Rápido</CardTitle>
                <CardDescription>
                  Enlaces directos a las funcionalidades más utilizadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {es_estudiante && (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/panel/proyectos')}
                    >
                      <FolderKanban className="mr-2 h-4 w-4" />
                      Ver todos mis proyectos
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/panel/observaciones')}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Ver observaciones pendientes
                    </Button>
                  </>
                )}
                {es_asesor && (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/panel/estudiantes')}
                    >
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Ver mis estudiantes
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/panel/revisar')}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Revisar documentos pendientes
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Panel;