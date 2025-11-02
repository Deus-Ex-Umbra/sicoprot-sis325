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
            <p className="sidebar-section-title">Administración</p>
            <nav className="space-y-1">
              <NavItem
                to="/panel/admin"
                end
                icon={<LayoutDashboard />}
                label="Panel"
              />
              <NavItem
                to="/panel/admin/usuarios"
                icon={<Users />}
                label="Usuarios"
              />
              <NavItem
                to="/panel/admin/solicitudes"
                icon={<UserCog />}
                label="Solicitudes"
              />
              <NavItem
                to="/panel/admin/periodos"
                icon={<Calendar />}
                label="Períodos"
              />
              <NavItem
                to="/panel/admin/grupos"
                icon={<LayersIcon />}
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