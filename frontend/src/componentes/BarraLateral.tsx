import { NavLink } from 'react-router-dom';
import {
  Home,
  FolderKanban,
  FileText,
  MessageSquare,
  Users,
  GraduationCap,
  ClipboardList,
  BookOpen,
} from 'lucide-react';
import { cn } from '../lib/utilidades';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { Rol } from '../tipos/usuario';

interface BarraLateralProps {
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
          'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground'
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

const BarraLateral = ({ isOpen }: BarraLateralProps) => {
  const { usuario } = useAutenticacion();

  const es_estudiante = usuario?.rol === Rol.Estudiante;
  const es_asesor = usuario?.rol === Rol.Asesor;

  return (
    <aside
      className={cn(
        'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-background transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <ScrollArea className="h-full py-4">
        <div className="space-y-4 px-3">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Principal
            </p>
            <nav className="space-y-1">
              <NavItem
                to="/panel"
                end
                icon={<Home className="h-4 w-4" />}
                label="Inicio"
              />
              <NavItem
                to="/panel/proyectos"
                icon={<FolderKanban className="h-4 w-4" />}
                label="Proyectos"
              />
            </nav>
          </div>

          {es_estudiante && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Estudiante
                </p>
                <nav className="space-y-1">
                  <NavItem
                    to="/panel/inscripcion-grupos"
                    icon={<Users className="h-4 w-4" />}
                    label="Grupos"
                  />
                  <NavItem
                    to="/panel/mis-documentos"
                    icon={<FileText className="h-4 w-4" />}
                    label="Mis Documentos"
                  />
                  <NavItem
                    to="/panel/observaciones"
                    icon={<MessageSquare className="h-4 w-4" />}
                    label="Observaciones"
                  />
                </nav>
              </div>
            </>
          )}

          {es_asesor && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Asesor
                </p>
                <nav className="space-y-1">
                  <NavItem
                    to="/panel/estudiantes"
                    icon={<GraduationCap className="h-4 w-4" />}
                    label="Mis Estudiantes"
                  />
                  <NavItem
                    to="/panel/gestion-observaciones"
                    icon={<ClipboardList className="h-4 w-4" />}
                    label="Observaciones"
                  />
                  <NavItem
                    to="/panel/revisar"
                    icon={<BookOpen className="h-4 w-4" />}
                    label="Revisar Documentos"
                  />
                </nav>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default BarraLateral;