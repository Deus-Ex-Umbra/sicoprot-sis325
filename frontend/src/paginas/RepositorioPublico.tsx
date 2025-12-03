import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, User, Calendar, Award, BookOpen, GraduationCap, LogIn } from 'lucide-react';
import { repositorioPublicoApi } from '../servicios/api';
import { SelectConBusqueda } from '../componentes/select-con-busqueda';
import { Card, CardContent, CardHeader, CardTitle } from '../componentes/ui/card';
import { Button } from '../componentes/ui/button';
import { Input } from '../componentes/ui/input';
import { Label } from '../componentes/ui/label';
import { Badge } from '../componentes/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../componentes/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../componentes/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../componentes/ui/alert';
import { SwitchModo } from '../componentes/switch-modo';

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
  perfil_aprobado?: boolean;
}

interface Asesor {
  id: number;
  nombre: string;
  apellido: string;
}

type TipoRepositorio = 'perfiles' | 'proyectos';

const RepositorioPublico = () => {
  const navigate = useNavigate();
  
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoRepositorio>('proyectos');
  const [proyectos, set_proyectos] = useState<ResultadoBusqueda[]>([]);
  const [perfiles, set_perfiles] = useState<ResultadoBusqueda[]>([]);
  const [cargando, set_cargando] = useState(false);
  const [error, set_error] = useState('');
  const [filtros, set_filtros] = useState({
    termino: '',
    anio: '',
    asesor_id: '',
  });

  const [asesores, set_asesores] = useState<Asesor[]>([]);
  const [mostrar_filtros, set_mostrar_filtros] = useState(false);

  useEffect(() => {
    cargar_datos_iniciales();
  }, []);

  useEffect(() => {
    buscar_contenido();
  }, [tipoSeleccionado]);

  const cargar_datos_iniciales = async () => {
    try {
      const asesores_data = await repositorioPublicoApi.obtenerAsesores();
      set_asesores(asesores_data);
      buscar_contenido();
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
  };

  const buscar_contenido = async () => {
    if (tipoSeleccionado === 'proyectos') {
      await buscar_proyectos();
    } else {
      await buscar_perfiles();
    }
  };

  const buscar_proyectos = async () => {
    try {
      set_cargando(true);
      set_error('');
      const params: any = {
        soloTerminados: true,
      };

      if (filtros.termino.trim()) params.termino = filtros.termino.trim();
      if (filtros.anio) params.anio = filtros.anio;
      if (filtros.asesor_id) params.asesorId = filtros.asesor_id;

      const resultados = await repositorioPublicoApi.buscarProyectos(params);
      set_proyectos(resultados);
    } catch (err: any) {
      set_error(err.response?.data?.message || 'Error al buscar proyectos');
    } finally {
      set_cargando(false);
    }
  };

  const buscar_perfiles = async () => {
    try {
      set_cargando(true);
      set_error('');
      const params: any = {
        soloPerfilesAprobados: true,
      };

      if (filtros.termino.trim()) params.termino = filtros.termino.trim();
      if (filtros.anio) params.anio = filtros.anio;
      if (filtros.asesor_id) params.asesorId = filtros.asesor_id;

      const resultados = await repositorioPublicoApi.buscarProyectos(params);
      set_perfiles(resultados);
    } catch (err: any) {
      set_error(err.response?.data?.message || 'Error al buscar perfiles');
    } finally {
      set_cargando(false);
    }
  };

  const limpiar_filtros = () => {
    set_filtros({
      termino: '',
      anio: '',
      asesor_id: '',
    });
    buscar_contenido();
  };

  const hay_filtros_activos = filtros.termino || filtros.anio || filtros.asesor_id;

  const opciones_asesores = asesores.map(a => ({
    value: String(a.id),
    label: `${a.nombre} ${a.apellido}`
  }));

  const anios_disponibles = Array.from(
    { length: new Date().getFullYear() - 2019 },
    (_, i) => (2020 + i).toString()
  ).reverse();

  const datosActuales = tipoSeleccionado === 'proyectos' ? proyectos : perfiles;

  const renderProyectoCard = (proyecto: ResultadoBusqueda, esPerfilView: boolean = false) => (
    <Card 
      key={proyecto.id} 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/repositorio/${proyecto.id}`)}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {esPerfilView ? (
                <BookOpen className="h-5 w-5 text-blue-500" />
              ) : (
                <GraduationCap className="h-5 w-5 text-green-600" />
              )}
              <h3 className="text-lg font-semibold">{proyecto.titulo}</h3>
              {!esPerfilView && proyecto.proyecto_aprobado && (
                <Badge variant="default" className="bg-green-500">
                  <Award className="h-3 w-3 mr-1" />
                  Defensa Aprobada
                </Badge>
              )}
              {esPerfilView && proyecto.perfil_aprobado && (
                <Badge variant="default" className="bg-blue-500">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Perfil Aprobado
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
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header público */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">SICOPROT</h1>
              <p className="text-xs text-muted-foreground">Repositorio Académico</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SwitchModo />
            <Button variant="outline" onClick={() => navigate('/iniciar-sesion')}>
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Repositorio Académico</h1>
            <p className="text-muted-foreground mt-1">
              Explora perfiles aprobados y proyectos de grado terminados
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

        {/* Tabs para cambiar entre Perfiles y Proyectos */}
        <Tabs value={tipoSeleccionado} onValueChange={(v) => setTipoSeleccionado(v as TipoRepositorio)} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="proyectos" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Proyectos Terminados
            </TabsTrigger>
            <TabsTrigger value="perfiles" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Perfiles Aprobados
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {mostrar_filtros && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtros de Búsqueda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="termino">Título del Proyecto</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="termino"
                      type="text"
                      placeholder="Título, resumen o palabras clave..."
                      value={filtros.termino}
                      onChange={(e) => set_filtros({ ...filtros, termino: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && buscar_contenido()}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anio">Año de Aprobación</Label>
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
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button onClick={buscar_contenido} disabled={cargando}>
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
        ) : datosActuales.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Se encontraron {datosActuales.length} {tipoSeleccionado === 'proyectos' ? 'proyecto' : 'perfil'}{datosActuales.length !== 1 ? 's' : ''}
            </p>
            
            {datosActuales.map((proyecto) => renderProyectoCard(proyecto, tipoSeleccionado === 'perfiles'))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              {tipoSeleccionado === 'proyectos' ? (
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              ) : (
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              )}
              <p className="text-lg font-medium mb-2">
                No se encontraron {tipoSeleccionado === 'proyectos' ? 'proyectos terminados' : 'perfiles aprobados'}
              </p>
              <p className="text-sm text-muted-foreground">
                {hay_filtros_activos
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : `No hay ${tipoSeleccionado === 'proyectos' ? 'proyectos' : 'perfiles'} disponibles en el repositorio`}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default RepositorioPublico;
