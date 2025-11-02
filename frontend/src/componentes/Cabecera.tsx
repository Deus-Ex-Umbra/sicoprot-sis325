import { useNavigate } from 'react-router-dom';
import { Menu, Settings, LogOut, Users, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { Rol } from '../tipos/usuario';

interface CabeceraProps {
  toggleSidebar: () => void;
}

const Cabecera = ({ toggleSidebar }: CabeceraProps) => {
  const { usuario, cerrarSesion } = useAutenticacion();
  const navigate = useNavigate();

  const manejar_cerrar_sesion = () => {
    cerrarSesion();
    navigate('/iniciar-sesion');
  };

  const es_estudiante = usuario?.rol === Rol.Estudiante;
  const tiene_grupo = es_estudiante && usuario?.perfil?.grupo;

  const obtener_iniciales = () => {
    if (usuario?.perfil) {
      return `${usuario.perfil.nombre?.[0] || ''}${usuario.perfil.apellido?.[0] || ''}`.toUpperCase();
    }
    return usuario?.correo?.[0]?.toUpperCase() || 'U';
  };

  const obtener_nombre_completo = () => {
    if (usuario?.perfil) {
      return `${usuario.perfil.nombre} ${usuario.perfil.apellido}`;
    }
    return usuario?.correo || '';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold tracking-tight">SICOPROT</h1>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Sistema de Control de Proyectos de Titulación
          </span>
        </div>

        <div className="flex-1" />

        {tiene_grupo && usuario?.perfil?.grupo && (
          <Badge
            variant="secondary"
            className="hidden md:flex items-center gap-1 cursor-pointer hover:bg-secondary/80 transition-colors"
            onClick={() => navigate('/panel/inscripcion-grupos')}
          >
            <Users className="h-3 w-3" />
            {usuario.perfil.grupo.nombre}
          </Badge>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {obtener_iniciales()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">
                {obtener_nombre_completo()}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{obtener_nombre_completo()}</p>
                <p className="text-xs text-muted-foreground">{usuario?.correo}</p>
                <Badge variant="outline" className="w-fit text-xs mt-1">
                  {usuario?.rol}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/panel/perfil')}>
              <Settings className="mr-2 h-4 w-4" />
              Mi Perfil
            </DropdownMenuItem>
            {tiene_grupo && (
              <DropdownMenuItem onClick={() => navigate('/panel/inscripcion-grupos')}>
                <Users className="mr-2 h-4 w-4" />
                Mi Grupo
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={manejar_cerrar_sesion} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Cabecera;