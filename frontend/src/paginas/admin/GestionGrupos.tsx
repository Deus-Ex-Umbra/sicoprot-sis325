import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash, 
  UserPlus, 
  UserMinus,
  Loader2,
  Search,
  X
} from 'lucide-react';
import { 
  gruposApi,
  periodosApi,
  asesoresApi,
  adminApi,
} from '../../servicios/api';
import { type Grupo, type Periodo, type Usuario, type Estudiante } from '../../tipos/usuario';
import { toast } from 'sonner';
import { cn } from '../../lib/utilidades';
import BarraLateralAdmin from '../../componentes/barra-lateral-admin';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Rol } from '../../tipos/usuario';
import { Button } from '../../componentes/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../../componentes/ui/dialog';
import { Input } from '../../componentes/ui/input';
import { Label } from '../../componentes/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../componentes/ui/select';
import { Switch } from '../../componentes/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';
import { Textarea } from '../../componentes/ui/textarea';
import BarraLateral from '../../componentes/barra-lateral';
import { SelectConBusqueda } from '../../componentes/select-con-busqueda';

const GestionGrupos = () => {
  const [grupos, set_grupos] = useState<Grupo[]>([]);
  const [grupos_filtrados, set_grupos_filtrados] = useState<Grupo[]>([]);
  const [periodos, set_periodos] = useState<Periodo[]>([]);
  const [asesores, set_asesores] = useState<Usuario[]>([]);
  const [estudiantes_sin_grupo, set_estudiantes_sin_grupo] = useState<Estudiante[]>([]);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  
  const [mostrar_modal_grupo, set_mostrar_modal_grupo] = useState(false);
  const [mostrar_modal_estudiantes, set_mostrar_modal_estudiantes] = useState(false);
  
  const [grupo_editando, set_grupo_editando] = useState<Grupo | null>(null);
  const [grupo_seleccionado, set_grupo_seleccionado] = useState<Grupo | null>(null);
  const [form_grupo, set_form_grupo] = useState({
    nombre: '',
    descripcion: '',
    id_asesor: 0,
    id_periodo: 0,
    activo: true,
  });

  const [filtros, set_filtros] = useState({
    busqueda: '',
    id_periodo: '',
    id_asesor: '',
  });

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
  }, [filtros, grupos]);

  const cargarDatos = async () => {
    try {
      set_cargando(true);
      const [grupos_data, periodos_data, asesores_data, estudiantes_data] = await Promise.all([
        gruposApi.obtenerTodos(),
        periodosApi.obtenerTodos(),
        asesoresApi.obtenerTodos(),
        adminApi.obtenerEstudiantesSinGrupo(),
      ]);
      set_grupos(grupos_data);
      set_grupos_filtrados(grupos_data);
      set_periodos(periodos_data);
      set_asesores(asesores_data);
      set_estudiantes_sin_grupo(estudiantes_data);
    } catch (err) {
      set_error('Error al cargar los datos');
    } finally {
      set_cargando(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...grupos];

    if (filtros.busqueda) {
      const busqueda_lower = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(grupo =>
        grupo.nombre.toLowerCase().includes(busqueda_lower) ||
        (grupo.descripcion && grupo.descripcion.toLowerCase().includes(busqueda_lower))
      );
    }

    if (filtros.id_periodo) {
      resultado = resultado.filter(grupo => grupo.periodo?.id === parseInt(filtros.id_periodo));
    }

    if (filtros.id_asesor) {
      resultado = resultado.filter(grupo => grupo.asesor?.id === parseInt(filtros.id_asesor));
    }

    set_grupos_filtrados(resultado);
  };

  const limpiarFiltros = () => {
    set_filtros({
      busqueda: '',
      id_periodo: '',
      id_asesor: '',
    });
  };

  const abrirModalCrear = () => {
    set_grupo_editando(null);
    const periodo_activo = periodos.find(p => p.activo);
    set_form_grupo({
      nombre: '',
      descripcion: '',
      id_asesor: 0,
      id_periodo: periodo_activo?.id || 0,
      activo: true,
    });
    set_mostrar_modal_grupo(true);
  };

  const abrirModalEditar = (grupo: Grupo) => {
    set_grupo_editando(grupo);
    set_form_grupo({
      nombre: grupo.nombre,
      descripcion: grupo.descripcion || '',
      id_asesor: grupo.asesor?.id || 0,
      id_periodo: grupo.periodo?.id || 0,
      activo: grupo.activo,
    });
    set_mostrar_modal_grupo(true);
  };

  const abrirModalEstudiantes = async (grupo: Grupo) => {
    set_grupo_seleccionado(grupo);
    await cargarDatos();
    set_mostrar_modal_estudiantes(true);
  };

  const manejarGuardar = async () => {
    try {
      if (grupo_editando) {
        await gruposApi.actualizar(grupo_editando.id, form_grupo);
        toast.success('Grupo actualizado exitosamente');
      } else {
        await gruposApi.crear(form_grupo);
        toast.success('Grupo creado exitosamente');
      }
      set_mostrar_modal_grupo(false);
      await cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar grupo');
    }
  };

  const manejarEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este grupo?')) return;

    try {
      await gruposApi.eliminar(id);
      toast.success('Grupo eliminado exitosamente');
      await cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar grupo');
    }
  };

  const manejarAsignarEstudiante = async (estudiante_id: number) => {
    if (!grupo_seleccionado) return;

    try {
      await gruposApi.asignarEstudiante(grupo_seleccionado.id, { id_estudiante: estudiante_id });
      toast.success('Estudiante asignado exitosamente');
      await cargarDatos();
      const grupo_actualizado = await gruposApi.obtenerUno(grupo_seleccionado.id);
      set_grupo_seleccionado(grupo_actualizado);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al asignar estudiante');
    }
  };

  const manejarRemoverEstudiante = async (estudiante_id: number) => {
    if (!grupo_seleccionado) return;
    
    if (!window.confirm('¿Está seguro de remover este estudiante del grupo?')) return;

    try {
      await gruposApi.removerEstudiante(grupo_seleccionado.id, estudiante_id);
      toast.success('Estudiante removido exitosamente');
      await cargarDatos();
      const grupo_actualizado = await gruposApi.obtenerUno(grupo_seleccionado.id);
      set_grupo_seleccionado(grupo_actualizado);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al remover estudiante');
    }
  };

  const opciones_asesores = asesores.map(asesor => ({
    value: String(asesor.perfil?.id_asesor),
    label: `${asesor.perfil?.nombre} ${asesor.perfil?.apellido}`
  }));

  const opciones_periodos = periodos.map(periodo => ({
    value: String(periodo.id),
    label: periodo.nombre
  }));

  const hay_filtros_activos = filtros.busqueda || filtros.id_periodo || filtros.id_asesor;

  let contenido_pagina;

  if (cargando) {
    contenido_pagina = (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  } else if (error) {
    contenido_pagina = <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
  } else {
    contenido_pagina = (
      <>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="busqueda">Buscar por Nombre</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="busqueda"
                    type="text"
                    placeholder="Nombre o descripción..."
                    value={filtros.busqueda}
                    onChange={(e) => set_filtros({ ...filtros, busqueda: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filtro-periodo">Período</Label>
                <Select
                  value={filtros.id_periodo}
                  onValueChange={(value) => set_filtros({ ...filtros, id_periodo: value === 'todos' ? '' : value })}
                >
                  <SelectTrigger id="filtro-periodo">
                    <SelectValue placeholder="Todos los períodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los períodos</SelectItem>
                    {periodos.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filtro-asesor">Asesor</Label>
                <SelectConBusqueda
                  opciones={opciones_asesores}
                  value={filtros.id_asesor}
                  onChange={(value) => set_filtros({ ...filtros, id_asesor: value })}
                  placeholder="Todos los asesores"
                  searchPlaceholder="Buscar asesor..."
                  emptyMessage="No se encontró el asesor."
                />
              </div>
            </div>
            {hay_filtros_activos && (
              <div className="mt-4 flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={limpiarFiltros}
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpiar Filtros
                </Button>
                <span className="text-muted-foreground text-sm">
                  Mostrando {grupos_filtrados.length} de {grupos.length} grupos
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Grupos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Asesor</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Estudiantes</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grupos_filtrados.map((grupo) => (
                  <TableRow key={grupo.id}>
                    <TableCell className="font-medium">{grupo.nombre}</TableCell>
                    <TableCell>{grupo.descripcion || '-'}</TableCell>
                    <TableCell>
                      {grupo.asesor?.nombre} {grupo.asesor?.apellido}
                    </TableCell>
                    <TableCell>
                      <Badge variant={grupo.periodo?.activo ? 'default' : 'secondary'}>
                        {grupo.periodo?.nombre}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{grupo.estudiantes?.length || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={grupo.activo ? 'default' : 'secondary'}>
                        {grupo.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirModalEstudiantes(grupo)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" /> Estudiantes
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => abrirModalEditar(grupo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => manejarEliminar(grupo.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {grupos_filtrados.length === 0 && (
              <p className="text-muted-foreground text-center py-10">
                No hay grupos que coincidan con los filtros.
              </p>
            )}
          </CardContent>
        </Card>
      </>
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Grupos</h1>
            <Button onClick={abrirModalCrear}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Grupo
            </Button>
          </div>
          
          {contenido_pagina}

          {/* Modal Crear/Editar Grupo */}
          <Dialog open={mostrar_modal_grupo} onOpenChange={set_mostrar_modal_grupo}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{grupo_editando ? 'Editar' : 'Crear'} Grupo</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Grupo</Label>
                    <Input
                      id="nombre"
                      value={form_grupo.nombre}
                      onChange={(e) => set_form_grupo({ ...form_grupo, nombre: e.target.value })}
                      placeholder="Ej: Grupo A - Ing. Software"
                    />
                  </div>
                  <div className="space-y-2 pt-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="activo"
                        checked={form_grupo.activo}
                        onCheckedChange={(checked) => set_form_grupo({ ...form_grupo, activo: checked })}
                      />
                      <Label htmlFor="activo">Grupo Activo</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={form_grupo.descripcion}
                    onChange={(e) => set_form_grupo({ ...form_grupo, descripcion: e.target.value })}
                    placeholder="Descripción del grupo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="asesor">Asesor Asignado</Label>
                    <SelectConBusqueda
                      opciones={opciones_asesores}
                      value={String(form_grupo.id_asesor || '')}
                      onChange={(value) => set_form_grupo({ ...form_grupo, id_asesor: parseInt(value) || 0 })}
                      placeholder="Seleccione un asesor..."
                      searchPlaceholder="Buscar asesor..."
                      emptyMessage="No se encontró el asesor."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodo">Período</Label>
                    <Select
                      value={String(form_grupo.id_periodo || '')}
                      onValueChange={(value) => set_form_grupo({ ...form_grupo, id_periodo: parseInt(value) || 0 })}
                    >
                      <SelectTrigger id="periodo">
                        <SelectValue placeholder="Seleccione un período..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Seleccione un período...</SelectItem>
                        {periodos.map(periodo => (
                          <SelectItem key={periodo.id} value={String(periodo.id)}>
                            {periodo.nombre} {periodo.activo && '(Activo)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={manejarGuardar}>
                  {grupo_editando ? 'Actualizar' : 'Crear'} Grupo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal Gestionar Estudiantes */}
          <Dialog open={mostrar_modal_estudiantes} onOpenChange={set_mostrar_modal_estudiantes}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Gestionar Estudiantes - {grupo_seleccionado?.nombre}</DialogTitle>
              </DialogHeader>
              <div className="py-4 grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h6 className="font-semibold">Estudiantes en el Grupo</h6>
                  <div className="border rounded-md max-h-60 overflow-y-auto">
                    {grupo_seleccionado?.estudiantes && grupo_seleccionado.estudiantes.length > 0 ? (
                      <div className="divide-y">
                        {grupo_seleccionado.estudiantes.map((estudiante: any) => (
                          <div
                            key={estudiante.id}
                            className="flex justify-between items-center p-3"
                          >
                            <span>{estudiante.nombre} {estudiante.apellido}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => manejarRemoverEstudiante(estudiante.id)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center p-4">No hay estudiantes en este grupo</p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h6 className="font-semibold">Estudiantes Disponibles</h6>
                  <div className="border rounded-md max-h-60 overflow-y-auto">
                    {estudiantes_sin_grupo.length > 0 ? (
                      <div className="divide-y">
                        {estudiantes_sin_grupo.map((estudiante: any) => (
                          <div
                            key={estudiante.id}
                            className="flex justify-between items-center p-3"
                          >
                            <span>{estudiante.nombre} {estudiante.apellido}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => manejarAsignarEstudiante(estudiante.id)}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center p-4">No hay estudiantes sin grupo</p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cerrar</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default GestionGrupos;