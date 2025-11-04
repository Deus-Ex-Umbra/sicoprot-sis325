import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Calendar,
  LayersIcon,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../lib/utilidades';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useAutenticacion } from '../contextos/autenticacion-contexto';
import { useState } from 'react';
import { obtenerUrlFoto } from '../servicios/api';

interface BarraLateralAdminProps {
  isOpen: boolean;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

const NavItem = ({ to, icon, label, end = false }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'sidebar-nav-item',
          isActive && 'active'
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

const BarraLateralAdmin = ({ isOpen }: BarraLateralAdminProps) => {
  const { usuario, cerrarSesion } = useAutenticacion();
  const navegar = useNavigate();
  const [colapsado, setColapsado] = useState(false);

  const manejar_cerrar_sesion = () => {
    cerrarSesion();
    navegar('/iniciar-sesion');
  };

  const obtener_iniciales = () => {
    if (usuario?.perfil) {
      return `${usuario.perfil.nombre?.[0] || ''}${usuario.perfil.apellido?.[0] || ''}`.toUpperCase();
    }
    return usuario?.correo?.[0]?.toUpperCase() || 'A';
  };

  const obtener_nombre_completo = () => {
    if (usuario?.perfil) {
      return `${usuario.perfil.nombre} ${usuario.perfil.apellido}`;
    }
    return usuario?.correo || '';
  };

  const ruta_foto = obtenerUrlFoto(usuario?.ruta_foto || usuario?.perfil?.ruta_foto);

  return (
    <aside
      className={cn(
        'fixed left-0 z-40 h-[calc(100vh-0.0rem)] flex flex-col sidebar-desktop smooth-transition',
        isOpen ? (colapsado ? 'w-20' : 'w-64') : 'w-0 -translate-x-full'
      )}
    >
      {isOpen && (
        <>
          <div className="border-b-2 border-border p-4 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className={cn("flex items-center gap-3", colapsado && "justify-center w-full")}>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-primary-foreground">S</span>
                </div>
                {!colapsado && (
                  <div>
                    <h1 className="text-lg font-bold text-foreground tracking-tight">
                      SICOPROT
                    </h1>
                    <p className="text-xs text-muted-foreground font-medium">
                      Administración
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

          <ScrollArea className="flex-1 py-4">
            <div className="space-y-4 px-3">
              <div className="space-y-1">
                {!colapsado && <p className="sidebar-section-title">Administración</p>}
                <nav className="space-y-1">
                  <NavItem
                    to="/panel/admin"
                    end
                    icon={<LayoutDashboard />}
                    label={colapsado ? '' : 'Panel'}
                  />
                  <NavItem
                    to="/panel/admin/usuarios"
                    icon={<Users />}
                    label={colapsado ? '' : 'Usuarios'}
                  />
                  <NavItem
                    to="/panel/admin/solicitudes"
                    icon={<UserCog />}
                    label={colapsado ? '' : 'Solicitudes'}
                  />
                  <NavItem
                    to="/panel/admin/solicitudes-defensa"
                    icon={<ShieldCheck />}
                    label={colapsado ? '' : 'Solicitudes Defensa'}
                  />
                  <NavItem
                    to="/panel/admin/periodos"
                    icon={<Calendar />}
                    label={colapsado ? '' : 'Períodos'}
                  />
                  <NavItem
                    to="/panel/admin/grupos"
                    icon={<LayersIcon />}
                    label={colapsado ? '' : 'Grupos'}
                  />
                  <NavItem
                    to="/panel/configuracion"
                    icon={<Settings />}
                    label={colapsado ? '' : 'Configuración'}
                  />
                </nav>
              </div>
            </div>
          </ScrollArea>

          <div className="border-t-2 border-border p-4 space-y-3 bg-secondary/20">
            {!colapsado ? (
              <>
                <div 
                  className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3 border border-border hover:bg-secondary/80 hover:shadow-md transition-all duration-200 cursor-pointer" 
                  onClick={() => navegar('/panel/perfil')}
                >
                  <Avatar className="h-11 w-11 flex-shrink-0 hover:scale-110 transition-transform duration-200">
                    <AvatarImage src={ruta_foto} />
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
                  onClick={manejar_cerrar_sesion}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Cerrar Sesión</span>
                </Button>
              </>
            ) : (
              <>
                <Avatar 
                  className="h-11 w-11 mx-auto hover:scale-110 transition-transform duration-200 cursor-pointer" 
                  onClick={() => navegar('/panel/perfil')}
                >
                  <AvatarImage src={ruta_foto} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-base font-bold">
                    {obtener_iniciales()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full h-11 text-destructive hover:text-destructive hover:bg-destructive/15 hover:scale-110 transition-all duration-200"
                  onClick={manejar_cerrar_sesion}
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </aside>
  );
};

export default BarraLateralAdmin;