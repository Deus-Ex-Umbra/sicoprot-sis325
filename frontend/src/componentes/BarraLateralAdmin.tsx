import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Calendar,
  LayersIcon,
} from 'lucide-react';
import { cn } from '../lib/utilidades';
import { ScrollArea } from './ui/scroll-area';

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

const BarraLateralAdmin = ({ isOpen }: BarraLateralAdminProps) => {
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
              Administración
            </p>
            <nav className="space-y-1">
              <NavItem
                to="/panel/admin"
                end
                icon={<LayoutDashboard className="h-4 w-4" />}
                label="Panel"
              />
              <NavItem
                to="/panel/admin/usuarios"
                icon={<Users className="h-4 w-4" />}
                label="Usuarios"
              />
              <NavItem
                to="/panel/admin/solicitudes"
                icon={<UserCog className="h-4 w-4" />}
                label="Solicitudes"
              />
              <NavItem
                to="/panel/admin/periodos"
                icon={<Calendar className="h-4 w-4" />}
                label="Períodos"
              />
              <NavItem
                to="/panel/admin/grupos"
                icon={<LayersIcon className="h-4 w-4" />}
                label="Grupos"
              />
            </nav>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default BarraLateralAdmin;