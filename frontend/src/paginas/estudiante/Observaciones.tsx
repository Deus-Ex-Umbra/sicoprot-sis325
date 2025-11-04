import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { observacionesApi } from '../../servicios/api';
import { type Observacion, EstadoObservacion } from '../../tipos/usuario';
import BarraLateral from '../../componentes/barra-lateral';
import BarraLateralAdmin from '../../componentes/barra-lateral-admin';
import { cn } from '../../lib/utilidades';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Rol } from '../../tipos/usuario';
import { Card, CardContent, CardHeader, CardTitle } from '../../componentes/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';
import ChecklistObservaciones from '../../componentes/checklist-observaciones';

const Observaciones = () => {
  const [observaciones, set_observaciones] = useState<Observacion[]>([]);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);

  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const data = await observacionesApi.obtenerPorEstudiante();
      set_observaciones(data);
    } catch (err) {
      set_error('Error al cargar observaciones');
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
  } else if (error) {
    contenido_pagina = (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  } else {
    contenido_pagina = (
      <ChecklistObservaciones observaciones={observaciones} />
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
           <h1 className="text-3xl font-bold tracking-tight mb-6">Mis Observaciones</h1>
          {contenido_pagina}
        </div>
      </main>
    </div>
  );
};

export default Observaciones;