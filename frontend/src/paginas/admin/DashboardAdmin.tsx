import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCog, 
  Layers, 
  Calendar, 
  GraduationCap, 
  Briefcase,
  Loader2
} from 'lucide-react';
import { adminApi } from '../../servicios/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../componentes/ui/card';
import { cn } from '../../lib/utilidades';
import BarraLateralAdmin from '../../componentes/barra-lateral-admin';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Rol } from '../../tipos/usuario';
import BarraLateral from '../../componentes/barra-lateral';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [estadisticas, set_estadisticas] = useState<any>(null);
  const [cargando, set_cargando] = useState(true);
  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);
  
  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const data = await adminApi.obtenerEstadisticas();
      set_estadisticas(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      set_cargando(false);
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card 
          className="text-center h-full hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/panel/admin/usuarios')}
        >
          <CardHeader>
            <Users size={40} className="mb-3 text-primary mx-auto" />
            <CardTitle>Gestión de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {estadisticas?.total_usuarios || 0}
            </p>
            <p className="text-muted-foreground text-sm">
              {estadisticas?.usuarios_activos || 0} activos
            </p>
          </CardContent>
        </Card>

        <Card 
          className="text-center h-full hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/panel/admin/solicitudes')}
        >
          <CardHeader>
            <UserCog size={40} className="mb-3 text-yellow-500 mx-auto" />
            <CardTitle>Solicitudes de Registro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {estadisticas?.solicitudes_pendientes || 0}
            </p>
            <p className="text-muted-foreground text-sm">
              pendientes
            </p>
          </CardContent>
        </Card>

        <Card 
          className="text-center h-full hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/panel/admin/grupos')}
        >
          <CardHeader>
            <Layers size={40} className="mb-3 text-green-500 mx-auto" />
            <CardTitle>Gestión de Grupos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Administrar grupos de trabajo</p>
          </CardContent>
        </Card>

        <Card 
          className="text-center h-full hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/panel/admin/periodos')}
        >
          <CardHeader>
            <Calendar size={40} className="mb-3 text-blue-500 mx-auto" />
            <CardTitle>Gestión de Períodos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Administrar semestres</p>
          </CardContent>
        </Card>

        <Card className="text-center h-full">
          <CardHeader>
            <GraduationCap size={40} className="mb-3 text-red-500 mx-auto" />
            <CardTitle>Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {estadisticas?.total_estudiantes || 0}
            </p>
            <p className="text-muted-foreground text-sm">
              {estadisticas?.estudiantes_sin_grupo || 0} sin grupo
            </p>
          </CardContent>
        </Card>

        <Card className="text-center h-full">
          <CardHeader>
            <Briefcase size={40} className="mb-3 text-gray-500 mx-auto" />
            <CardTitle>Asesores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {estadisticas?.total_asesores || 0}
            </p>
            <p className="text-muted-foreground text-sm">
              asesores registrados
            </p>
          </CardContent>
        </Card>
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
          <h1 className="text-3xl font-bold tracking-tight mb-6">Panel de Administración</h1>
          {contenido_pagina}
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;