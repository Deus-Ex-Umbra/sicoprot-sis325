import { useState, useEffect } from 'react';
import { Search, Filter, X, FileText, User, Calendar, Award } from 'lucide-react';
import { proyectosApi, asesoresApi, periodosApi } from '../servicios/api';
import { useAutenticacion } from '../contextos/autenticacion-contexto';
import BarraLateral from '../componentes/barra-lateral';
import BarraLateralAdmin from '../componentes/barra-lateral-admin';
import { SelectConBusqueda } from '../componentes/select-con-busqueda';
import { Rol, type Usuario } from '../tipos/usuario';
import { cn } from '../lib/utilidades';
import { Card, CardContent, CardHeader, CardTitle } from '../componentes/ui/card';
import { Button } from '../componentes/ui/button';
import { Input } from '../componentes/ui/input';
import { Label } from '../componentes/ui/label';
import { Badge } from '../componentes/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../componentes/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../componentes/ui/alert';
import { Separator } from '../componentes/ui/separator';

interface ResultadoBusqueda {
  id: number;
  titulo: string;
  resumen?: string;
  palabras_clave: string[];
  autor: string;
  asesor: string;
  fecha_creacion: Date;
  etapa_actual: string;
  proyecto_aprobado: boolean;
}

const Repositorio = () => {
  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);
  
  const [proyectos, set_proyectos] = useState<ResultadoBusqueda[]>([]);
  const [cargando, set_cargando] = useState(false);
  const [error, set_error] = useState('');

  const [filtros, set_filtros] = useState({
    termino: '',
    anio: '',
    carrera: '',
    asesor_id: '',
    solo_aprobados: true,
  });

  const [asesores, set_asesores] = useState<Usuario[]>([]);
  const [periodos, set_periodos] = useState<Array<{ id: number; nombre: string }>>([]);
  const [mostrar_filtros, set_mostrar_filtros] = useState(false);

  const es_admin = usuario?.rol === Rol.Administrador;

  useEffect(() => {
    cargar_datos_iniciales();
    buscar_proyectos();
  }, []);

  const cargar_datos_iniciales = async () => {
    try {
      const [asesores_data, periodos_data] = await Promise.all([
        asesoresApi.obtenerTodos(),
        periodosApi.obtenerTodos(),
      ]);
      set_asesores(asesores_data);
      set_periodos(periodos_data);
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
  };

  const buscar_proyectos = async () => {
    try {
      set_cargando(true);
      set_error('');
      
      const params: any = {
        soloAprobados: filtros.solo_aprobados,
      };

      if (filtros.termino.trim()) params.termino = filtros.termino.trim();
      if (filtros.anio) params.anio = filtros.anio;
      if (filtros.carrera.trim()) params.carrera = filtros.carrera.trim();
      if (filtros.asesor_id) params.asesorId = filtros.asesor_id;

      const resultados = await proyectosApi.buscarProyectos(params);
      set_proyectos(resultados);
    } catch (err: any) {
      set_error(err.response?.data?.message || 'Error al buscar proyectos');
    } finally {
      set_cargando(false);
    }
  };

  const limpiar_filtros = () => {
    set_filtros({
      termino: '',
      anio: '',
      carrera: '',
      asesor_id: '',
      solo_aprobados: true,
    });
  };

  const hay_filtros_activos = filtros.termino || filtros.anio || filtros.carrera || filtros.asesor_id;

  const opciones_asesores = asesores.map(a => ({
    value: String(a.perfil?.id_asesor),
    label: `${a.perfil?.nombre} ${a.perfil?.apellido}`
  }));

  const anios_disponibles = Array.from(
    { length: new Date().getFullYear() - 2019 },
    (_, i) => (2020 + i).toString()
  ).reverse();

  return (
    <div className="min-h-screen bg-background">
      {es_admin ? (
        <BarraLateralAdmin isOpen={sidebar_open} />
      ) : (
        <BarraLateral isOpen={sidebar_open} />
      )}

      <main
        className={cn(
          'transition-all duration-300',
          sidebar_open ? 'ml-64' : 'ml-0'
        )}
      >
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Repositorio de Proyectos</h1>
              <p className="text-muted-foreground mt-1">
                Explora y busca proyectos de grado terminados
              </p>
            </div>
            <Button
              variant={mostrar_filtros ? 'default' : 'outline'}
              onClick={() => set_mostrar_filtros(!mostrar_filtros)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {mostrar_filtros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
          </div>

          {mostrar_filtros && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filtros de Búsqueda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="termino">Término de búsqueda</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="termino"
                        type="text"
                        placeholder="Título, resumen o palabras clave..."
                        value={filtros.termino}
                        onChange={(e) => set_filtros({ ...filtros, termino: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && buscar_proyectos()}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anio">Año</Label>
                    <Select
                      value={filtros.anio}
                      onValueChange={(value) => set_filtros({ ...filtros, anio: value === 'todos' ? '' : value })}
                    >
                      <SelectTrigger id="anio">
                        <SelectValue placeholder="Todos los años" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="todos">Todos los años</SelectItem>
                        {anios_disponibles.map((anio) => (
                          <SelectItem key={anio} value={anio}>
                            {anio}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carrera">Carrera</Label>
                    <Input
                      id="carrera"
                      type="text"
                      placeholder="Ej: Ingeniería de Sistemas"
                      value={filtros.carrera}
                      onChange={(e) => set_filtros({ ...filtros, carrera: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asesor">Asesor</Label>
                    <SelectConBusqueda
                      opciones={opciones_asesores}
                      value={filtros.asesor_id}
                      onChange={(value) => set_filtros({ ...filtros, asesor_id: value })}
                      placeholder="Todos los asesores"
                      searchPlaceholder="Buscar asesor..."
                      emptyMessage="No se encontró el asesor."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="solo_aprobados">Estado</Label>
                    <Select
                      value={filtros.solo_aprobados ? 'aprobados' : 'todos'}
                      onValueChange={(value) => set_filtros({ ...filtros, solo_aprobados: value === 'aprobados' })}
                    >
                      <SelectTrigger id="solo_aprobados">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="aprobados">Solo Aprobados</SelectItem>
                        <SelectItem value="todos">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button onClick={buscar_proyectos} disabled={cargando}>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </Button>
                  {hay_filtros_activos && (
                    <Button variant="outline" onClick={limpiar_filtros}>
                      <X className="mr-2 h-4 w-4" />
                      Limpiar Filtros
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {cargando ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : proyectos.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Se encontraron {proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''}
              </p>
              
              {proyectos.map((proyecto) => (
                <Card key={proyecto.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">{proyecto.titulo}</h3>
                          {proyecto.proyecto_aprobado && (
                            <Badge variant="default" className="bg-green-500">
                              <Award className="h-3 w-3 mr-1" />
                              Aprobado
                            </Badge>
                          )}
                        </div>

                        {proyecto.resumen && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {proyecto.resumen}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Autor: {proyecto.autor}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Asesor: {proyecto.asesor}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(proyecto.fecha_creacion).getFullYear()}</span>
                          </div>
                        </div>

                        {proyecto.palabras_clave && proyecto.palabras_clave.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {proyecto.palabras_clave.map((palabra, index) => (
                              <Badge key={index} variant="secondary">
                                {palabra}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No se encontraron proyectos</p>
                <p className="text-sm text-muted-foreground">
                  {hay_filtros_activos
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'No hay proyectos disponibles en el repositorio'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Repositorio;