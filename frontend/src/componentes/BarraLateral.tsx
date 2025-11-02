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

const BarraLateral = ({ isOpen }: BarraLateralProps) => {
  const { usuario } = useAutenticacion();

  const es_estudiante = usuario?.rol === Rol.Estudiante;
  const es_asesor = usuario?.rol === Rol.Asesor;

  return (
    <aside
      className={cn(
        'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 sidebar-desktop smooth-transition',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <ScrollArea className="h-full py-4">
        <div className="space-y-4 px-3">
          <div className="space-y-1">
            <p className="sidebar-section-title">Principal</p>
            <nav className="space-y-1">
              <NavItem
                to="/panel"
                end
                icon={<Home />}
                label="Inicio"
              />
              <NavItem
                to="/panel/proyectos"
                icon={<FolderKanban />}
                label="Proyectos"
              />
            </nav>
          </div>

          {es_estudiante && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="sidebar-section-title">Estudiante</p>
                <nav className="space-y-1">
                  <NavItem
                    to="/panel/inscripcion-grupos"
                    icon={<Users />}
                    label="Grupos"
                  />
                  <NavItem
                    to="/panel/mis-documentos"
                    icon={<FileText />}
                    label="Mis Documentos"
                  />
                  <NavItem
                    to="/panel/observaciones"
                    icon={<MessageSquare />}
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
                <p className="sidebar-section-title">Asesor</p>
                <nav className="space-y-1">
                  <NavItem
                    to="/panel/estudiantes"
                    icon={<GraduationCap />}
                    label="Mis Estudiantes"
                  />
                  <NavItem
                    to="/panel/gestion-observaciones"
                    icon={<ClipboardList />}
                    label="Observaciones"
                  />
                  <NavItem
                    to="/panel/revisar"
                    icon={<BookOpen />}
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