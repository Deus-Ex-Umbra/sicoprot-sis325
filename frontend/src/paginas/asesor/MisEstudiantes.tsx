import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2, Users, GraduationCap, Briefcase, Search, X } from 'lucide-react';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { asesoresApi } from '../../servicios/api';
import { type Proyecto, Rol, type Estudiante } from '../../tipos/usuario';
import BarraLateral from '../../componentes/barra-lateral';
import BarraLateralAdmin from '../../componentes/barra-lateral-admin';
import { cn } from '../../lib/utilidades';
import { Card, CardContent, CardHeader, CardTitle } from '../../componentes/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../componentes/ui/table';
import { Badge } from '../../componentes/ui/badge';
import { Button } from '../../componentes/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';
import { Input } from '../../componentes/ui/input';
import { Label } from '../../componentes/ui/label';

interface EstudianteGrupo {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  proyecto: string;
}

interface GrupoAsesor {
  id: number;
  nombre: string;
  tipo: 'taller_grado_i' | 'taller_grado_ii';
  descripcion?: string;
  activo: boolean;
  periodo: any;
  estudiantes: EstudianteGrupo[];
}

const MisEstudiantes = () => {
  const [grupos_data, set_grupos_data] = useState<GrupoAsesor[]>([]);
  const [grupos_filtrados, set_grupos_filtrados] = useState<GrupoAsesor[]>([]);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  const [filtro_busqueda, set_filtro_busqueda] = useState('');
  const navigate = useNavigate();
  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);

  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtro_busqueda, grupos_data]);

  const cargarDatos = async () => {
    try {
      const data = await asesoresApi.obtenerEstudiantesDeMiGrupo();
      set_grupos_data(data.grupos || []);
      set_grupos_filtrados(data.grupos || []);
    } catch (err) {
      set_error('No se pudo cargar la lista de estudiantes.');
    } finally {
      set_cargando(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...grupos_data];
    const busqueda_lower = filtro_busqueda.toLowerCase();

    if (busqueda_lower) {
      resultado = resultado.map(grupo => {
        const estudiantes_filtrados = grupo.estudiantes.filter(est => 
          est.nombre.toLowerCase().includes(busqueda_lower) ||
          est.apellido.toLowerCase().includes(busqueda_lower) ||
          est.correo.toLowerCase().includes(busqueda_lower) ||
          est.proyecto.toLowerCase().includes(busqueda_lower)
        );
        return { ...grupo, estudiantes: estudiantes_filtrados };
      }).filter(grupo => grupo.estudiantes.length > 0 || grupo.nombre.toLowerCase().includes(busqueda_lower));
    }

    set_grupos_filtrados(resultado);
  };

  const grupos_taller_i = grupos_filtrados.filter(g => g.tipo === 'taller_grado_i' && g.activo);
  const grupos_taller_ii = grupos_filtrados.filter(g => g.tipo === 'taller_grado_ii' && g.activo);

  const renderTablaGrupo = (grupo: GrupoAsesor) => (
    <Card key={grupo.id} className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{grupo.nombre}</span>
          <Badge variant="outline">{grupo.periodo?.nombre}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {grupo.estudiantes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grupo.estudiantes.map((estudiante) => (
                <TableRow key={estudiante.id}>
                  <TableCell className="font-medium">
                    {estudiante.nombre} {estudiante.apellido}
                  </TableCell>
                  <TableCell>{estudiante.correo}</TableCell>
                  <TableCell>{estudiante.proyecto || 'Sin proyecto'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/panel/proyectos`)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ver Proyectos
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            {filtro_busqueda ? 'No se encontraron estudiantes que coincidan.' : 'No hay estudiantes inscritos en este grupo.'}
          </p>
        )}
      </CardContent>
    </Card>
  );

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
  } else if (grupos_data.length === 0) {
    contenido_pagina = (
       <Alert>
          <AlertTitle>Sin Estudiantes</AlertTitle>
          <AlertDescription>
            No tienes estudiantes asignados a ningún grupo activo en este momento.
          </AlertDescription>
        </Alert>
    );
  } else {
    contenido_pagina = (
      <div className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="busqueda-estudiante">Buscar Estudiante o Proyecto</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="busqueda-estudiante"
                type="text"
                placeholder="Nombre, correo, proyecto..."
                value={filtro_busqueda}
                onChange={(e) => set_filtro_busqueda(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {grupos_taller_i.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
              <GraduationCap className="h-6 w-6 text-primary" />
              Taller de Grado I (Propuesta / Perfil)
            </h2>
            {grupos_taller_i.map(renderTablaGrupo)}
          </section>
        )}
        
        {grupos_taller_ii.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
              <Briefcase className="h-6 w-6 text-primary" />
              Taller de Grado II (Proyecto)
            </h2>
            {grupos_taller_ii.map(renderTablaGrupo)}
          </section>
        )}

        {grupos_filtrados.length === 0 && filtro_busqueda && (
           <Alert>
            <AlertTitle>No se encontraron resultados</AlertTitle>
            <AlertDescription>
              Ningún estudiante, proyecto o grupo coincide con "{filtro_busqueda}".
            </AlertDescription>
          </Alert>
        )}
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
          <h1 className="text-3xl font-bold tracking-tight mb-6">Mis Estudiantes</h1>
          {contenido_pagina}
        </div>
      </main>
    </div>
  );
};

export default MisEstudiantes;