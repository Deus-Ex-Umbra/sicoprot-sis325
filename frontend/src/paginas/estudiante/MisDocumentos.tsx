import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { proyectosApi } from '../../servicios/api';
import { type Proyecto, Rol } from '../../tipos/usuario';
import BarraLateral from '../../componentes/barra-lateral';
import BarraLateralAdmin from '../../componentes/barra-lateral-admin';
import { cn } from '../../lib/utilidades';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../componentes/ui/accordion';
import { Badge } from '../../componentes/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';

const MisDocumentos = () => {
  const [proyectos, set_proyectos] = useState<Proyecto[]>([]);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  const navigate = useNavigate();
  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);

  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const data = await proyectosApi.obtenerTodos();
        set_proyectos(data);
      } catch (err) {
        set_error('No se pudo cargar la lista de documentos.');
      } finally {
        set_cargando(false);
      }
    };
    cargarProyectos();
  }, []);

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
      <Accordion type="single" collapsible defaultValue="item-0">
        {proyectos.map((proyecto, index) => (
          <AccordionItem value={`item-${index}`} key={proyecto.id}>
            <AccordionTrigger className="text-lg font-medium">
              {proyecto.titulo}
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                {proyecto.documentos?.length ? (
                  proyecto.documentos.map(doc => (
                    <div
                      key={doc.id}
                      className="flex justify-between items-center p-3 rounded-md border hover:bg-accent cursor-pointer"
                      onClick={() => navigate(`/panel/proyecto/${proyecto.id}`)}
                    >
                      <span>{doc.nombre_archivo}</span>
                      <div className="flex gap-2">
                        <Badge variant="default">Versión {doc.version}</Badge>
                        <Badge variant="secondary">
                          {new Date(doc.fecha_subida).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No hay documentos en este proyecto.
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
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
          <h1 className="text-3xl font-bold tracking-tight mb-6">Mis Documentos</h1>
          {contenido_pagina}
        </div>
      </main>
    </div>
  );
};

export default MisDocumentos;