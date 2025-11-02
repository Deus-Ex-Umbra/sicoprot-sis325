import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Home,
  FolderKanban,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { useAutenticacion } from '../contextos/autenticacion-contexto';
import { cn } from '../lib/utilidades';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Rol } from '../tipos/usuario';

interface ItemMenu {
  icono: React.ElementType;
  etiqueta: string;
  ruta: string;
  roles?: Rol[];
}

const items_menu: ItemMenu[] = [
  { icono: Home, etiqueta: 'Inicio', ruta: '/panel', roles: [Rol.Estudiante, Rol.Asesor] },
  { icono: FolderKanban, etiqueta: 'Proyectos', ruta: '/panel/proyectos' },
  { icono: FileText, etiqueta: 'Mis Documentos', ruta: '/panel/mis-documentos', roles: [Rol.Estudiante] },
  { icono: MessageSquare, etiqueta: 'Observaciones', ruta: '/panel/observaciones', roles: [Rol.Estudiante] },
  { icono: MessageSquare, etiqueta: 'Observaciones', ruta: '/panel/gestion-observaciones', roles: [Rol.Asesor] },
  { icono: GraduationCap, etiqueta: 'Estudiantes', ruta: '/panel/estudiantes', roles: [Rol.Asesor] },
  { icono: BookOpen, etiqueta: 'Revisar', ruta: '/panel/revisar', roles: [Rol.Asesor] },
  { icono: Users, etiqueta: 'Mi Grupo', ruta: '/panel/inscripcion-grupos', roles: [Rol.Estudiante] },
  { icono: Settings, etiqueta: 'Configuración', ruta: '/panel/configuracion' },
];

export function MenuLateral() {
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const { cerrarSesion, usuario } = useAutenticacion();
  const [colapsado, setColapsado] = useState(false);

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navegar('/iniciar-sesion');
  };

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

  const items_filtrados = items_menu.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(usuario?.rol as Rol);
  });

  return (
    <div className={cn(
      "flex h-screen flex-col sidebar-desktop smooth-transition",
      colapsado ? "w-20" : "w-72"
    )}>
      <div className="border-b-2 border-border p-6 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-3", colapsado && "justify-center w-full")}>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary-foreground">S</span>
            </div>
            {!colapsado && (
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  SICOPROT
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Gestión de Proyectos
                </p>
              </div>
            )}
          </div>
          {!colapsado && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setColapsado(true)}
              className="h-8 w-8 hover:bg-primary/20 hover:scale-110 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
        </div>
        {colapsado && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setColapsado(false)}
            className="h-8 w-8 mt-2 mx-auto hover:bg-primary/20 hover:scale-110 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {items_filtrados.map((item) => {
            const Icono = item.icono;
            const activo = ubicacion.pathname === item.ruta;
            
            return (
              <Button
                key={item.ruta}
                variant={activo ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full h-14 font-medium transition-all duration-200 sidebar-nav-item',
                  colapsado ? 'justify-center px-0' : 'justify-start gap-3',
                  activo && 'active'
                )}
                onClick={() => navegar(item.ruta)}
                title={colapsado ? item.etiqueta : undefined}
              >
                <Icono className="h-5 w-5 flex-shrink-0" />
                {!colapsado && <span className="text-[16px]">{item.etiqueta}</span>}
              </Button>
            );
          })}
        </nav>
      </div>

      <div className="border-t-2 border-border p-4 space-y-3 bg-secondary/20">
        {!colapsado ? (
          <>
            <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3 border border-border hover:bg-secondary/80 hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => navegar('/panel/configuracion')}>
              <Avatar className="h-11 w-11 flex-shrink-0 hover:scale-110 transition-transform duration-200">
                {usuario?.ruta_foto && <AvatarImage src={usuario.ruta_foto} />}
                {usuario?.perfil?.ruta_foto && <AvatarImage src={usuario.perfil.ruta_foto} />}
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-base font-bold">
                  {obtener_iniciales()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-foreground">
                  {obtener_nombre_completo()}
                </p>
                <p className="truncate text-xs text-muted-foreground">{usuario?.correo}</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 text-destructive hover:text-destructive hover:bg-destructive/15 border border-transparent hover:border-destructive/30 font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
              onClick={manejarCerrarSesion}
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </Button>
          </>
        ) : (
          <>
            <Avatar className="h-11 w-11 mx-auto hover:scale-110 transition-transform duration-200 cursor-pointer" onClick={() => navegar('/panel/configuracion')}>
              {usuario?.ruta_foto && <AvatarImage src={usuario.ruta_foto} />}
              {usuario?.perfil?.ruta_foto && <AvatarImage src={usuario.perfil.ruta_foto} />}
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-base font-bold">
                {obtener_iniciales()}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-11 text-destructive hover:text-destructive hover:bg-destructive/15 hover:scale-110 transition-all duration-200"
              onClick={manejarCerrarSesion}
              title="Cerrar Sesión"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}