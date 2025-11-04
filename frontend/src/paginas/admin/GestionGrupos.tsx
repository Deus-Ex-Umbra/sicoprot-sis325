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
import { type Grupo, type Periodo, type Usuario, type Estudiante, Rol, type Proyecto } from '../../tipos/usuario';
import { toast } from 'sonner';
import { cn } from '../../lib/utilidades';
import BarraLateralAdmin from '../../componentes/barra-lateral-admin';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
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
import { MultiSelect, type OpcionMultiSelect } from '../../componentes/ui/multi-select';
import { ScrollArea } from '../../componentes/ui/scroll-area';

const GestionGrupos = () => {
  const [grupos, set_grupos] = useState<Grupo[]>([]);
  const [grupos_filtrados, set_grupos_filtrados] = useState<Grupo[]>([]);
  const [periodos, set_periodos] = useState<Periodo[]>([]);
  const [asesores, set_asesores] = useState<Usuario[]>([]);
  const [estudiantes_sin_grupo, set_estudiantes_sin_grupo] = useState<Usuario[]>([]);
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
    tipo: 'taller_grado_i' as 'taller_grado_i' | 'taller_grado_ii',
    carrera: '',
    fecha_limite_propuesta: '',
    fecha_limite_perfil: '',
    fecha_limite_proyecto: '',
    dias_revision_asesor: 7,
    dias_correccion_estudiante: 14,
  });

  const [estudiantes_a_asignar, set_estudiantes_a_asignar] = useState<string[]>([]);
  const [cargando_asignacion, set_cargando_asignacion] = useState(false);

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

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  }

  const abrirModalCrear = () => {
    set_grupo_editando(null);
    const periodo_activo = periodos.find(p => p.activo);
    set_form_grupo({
      nombre: '',
      descripcion: '',
      id_asesor: 0,
      id_periodo: periodo_activo?.id || 0,
      activo: true,
      tipo: 'taller_grado_i',
      carrera: '',
      fecha_limite_propuesta: '',
      fecha_limite_perfil: '',
      fecha_limite_proyecto: '',
      dias_revision_asesor: 7,
      dias_correccion_estudiante: 14,
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
      tipo: grupo.tipo || 'taller_grado_i',
      carrera: (grupo as any).carrera || '',
      fecha_limite_propuesta: formatDate((grupo as any).fecha_limite_propuesta),
      fecha_limite_perfil: formatDate((grupo as any).fecha_limite_perfil),
      fecha_limite_proyecto: formatDate((grupo as any).fecha_limite_proyecto),
      dias_revision_asesor: (grupo as any).dias_revision_asesor || 7,
      dias_correccion_estudiante: (grupo as any).dias_correccion_estudiante || 14,
    });
    set_mostrar_modal_grupo(true);
  };

  const abrirModalEstudiantes = async (grupo: Grupo) => {
    set_grupo_seleccionado(grupo);
    set_estudiantes_a_asignar([]);
    await cargarDatos();
    set_mostrar_modal_estudiantes(true);
  };

  const manejarGuardar = async () => {
    try {
      const datos_grupo = {
        ...form_grupo,
        id_asesor: Number(form_grupo.id_asesor),
        id_periodo: Number(form_grupo.id_periodo),
        dias_revision_asesor: Number(form_grupo.dias_revision_asesor),
        dias_correccion_estudiante: Number(form_grupo.dias_correccion_estudiante),
      };

      if (grupo_editando) {
        await gruposApi.actualizar(grupo_editando.id, datos_grupo);
        toast.success('Grupo actualizado exitosamente');
      } else {
        await gruposApi.crear(datos_grupo);
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

  const manejarAsignarMultiplesEstudiantes = async () => {
    if (!grupo_seleccionado || estudiantes_a_asignar.length === 0) return;

    set_cargando_asignacion(true);
    let asignados_count = 0;
    let errores_count = 0;

    for (const estudiante_id of estudiantes_a_asignar) {
      try {
        await gruposApi.asignarEstudiante(grupo_seleccionado.id, { id_estudiante: Number(estudiante_id) });
        asignados_count++;
      } catch (err: any) {
        errores_count++;
        toast.error(`Error al asignar estudiante ID ${estudiante_id}: ${err.response?.data?.message || 'Error'}`);
      }
    }

    set_cargando_asignacion(false);
    toast.success(`${asignados_count} estudiante(s) asignado(s) exitosamente.`);
    if (errores_count > 0) {
      toast.warning(`${errores_count} asignaciones fallaron (posiblemente ya estaban en otro grupo o no cumplen requisitos).`);
    }

    await cargarDatos();
    const grupo_actualizado = await gruposApi.obtenerUno(grupo_seleccionado.id);
    set_grupo_seleccionado(grupo_actualizado);
    set_estudiantes_a_asignar([]);
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
  
  const opciones_estudiantes_disponibles: OpcionMultiSelect[] = estudiantes_sin_grupo
    .filter((est: Usuario) => {
      if (!grupo_seleccionado) return false;
      const perfil_aprobado = est.perfil?.proyecto?.perfil_aprobado || false;
      if (grupo_seleccionado.tipo === 'taller_grado_i') {
        return !perfil_aprobado;
      }
      if (grupo_seleccionado.tipo === 'taller_grado_ii') {
        return perfil_aprobado;
      }
      return false;
    })
    .map((est: Usuario) => ({
      value: String(est.perfil?.id_estudiante),
      label: `${est.perfil?.nombre} ${est.perfil?.apellido} (${est.correo})`
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
                  <TableHead>Tipo</TableHead>
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
                    <TableCell>
                      <Badge variant="outline">
                        {grupo.tipo === 'taller_grado_i' ? 'Taller Grado I' : 'Taller Grado II'}
                      </Badge>
                    </TableCell>
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
          <Dialog open={mostrar_modal_grupo} onOpenChange={set_mostrar_modal_grupo}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>{grupo_editando ? 'Editar' : 'Crear'} Grupo</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[80vh]">
                <div className="py-4 px-6 space-y-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="carrera">Carrera</Label>
                    <Input
                      id="carrera"
                      value={form_grupo.carrera}
                      onChange={(e) => set_form_grupo({ ...form_grupo, carrera: e.target.value })}
                      placeholder="Ej: Ingeniería de Software"
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
                  <div className="space-y-2">
                    <Label htmlFor="tipo-grupo">Tipo de Grupo</Label>
                    <Select
                      value={form_grupo.tipo}
                      onValueChange={(value) => set_form_grupo({ ...form_grupo, tipo: value as any })}
                    >
                      <SelectTrigger id="tipo-grupo">
                        <SelectValue placeholder="Seleccione un tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="taller_grado_i">
                          Taller de Grado I (Propuesta y Perfil)
                        </SelectItem>
                        <SelectItem value="taller_grado_ii">
                          Taller de Grado II (Proyecto)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <h6 className="font-semibold pt-2">Fechas Límite (Taller I y II)</h6>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fecha_limite_propuesta">Límite Propuesta</Label>
                      <Input
                        id="fecha_limite_propuesta"
                        type="date"
                        value={form_grupo.fecha_limite_propuesta}
                        onChange={(e) => set_form_grupo({ ...form_grupo, fecha_limite_propuesta: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha_limite_perfil">Límite Perfil</Label>
                      <Input
                        id="fecha_limite_perfil"
                        type="date"
                        value={form_grupo.fecha_limite_perfil}
                        onChange={(e) => set_form_grupo({ ...form_grupo, fecha_limite_perfil: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha_limite_proyecto">Límite Proyecto Final</Label>
                      <Input
                        id="fecha_limite_proyecto"
                        type="date"
                        value={form_grupo.fecha_limite_proyecto}
                        onChange={(e) => set_form_grupo({ ...form_grupo, fecha_limite_proyecto: e.target.value })}
                      />
                    </div>
                  </div>

                  <h6 className="font-semibold pt-2">Tiempos de Revisión</h6>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dias_revision_asesor">Días Revisión (Asesor)</Label>
                      <Input
                        id="dias_revision_asesor"
                        type="number"
                        value={form_grupo.dias_revision_asesor}
                        onChange={(e) => set_form_grupo({ ...form_grupo, dias_revision_asesor: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dias_correccion_estudiante">Días Corrección (Estudiante)</Label>
                      <Input
                        id="dias_correccion_estudiante"
                        type="number"
                        value={form_grupo.dias_correccion_estudiante}
                        onChange={(e) => set_form_grupo({ ...form_grupo, dias_correccion_estudiante: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                </div>
              </ScrollArea>
              <DialogFooter className="px-6 pb-4 pt-0">
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={manejarGuardar}>
                  {grupo_editando ? 'Actualizar' : 'Crear'} Grupo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={mostrar_modal_estudiantes} onOpenChange={set_mostrar_modal_estudiantes}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Gestionar Estudiantes - {grupo_seleccionado?.nombre}</DialogTitle>
              </DialogHeader>
              <div className="py-4 grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h6 className="font-semibold">Estudiantes en el Grupo ({grupo_seleccionado?.estudiantes?.length || 0})</h6>
                  <ScrollArea className="h-60 w-full rounded-md border">
                    <div className="p-4">
                      {grupo_seleccionado?.estudiantes && grupo_seleccionado.estudiantes.length > 0 ? (
                        <div className="divide-y">
                          {grupo_seleccionado.estudiantes.map((estudiante: any) => (
                            <div
                              key={estudiante.id}
                              className="flex justify-between items-center py-2"
                            >
                              <span className="text-sm">{estudiante.nombre} {estudiante.apellido}</span>
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
                        <p className="text-muted-foreground text-center text-sm p-4">No hay estudiantes en este grupo</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
                <div className="space-y-4">
                  <h6 className="font-semibold">Asignar Estudiantes Disponibles</h6>
                  <p className="text-xs text-muted-foreground">
                    Mostrando estudiantes para {grupo_seleccionado?.tipo === 'taller_grado_i' ? 'Taller I (Sin perfil)' : 'Taller II (Con perfil)'}.
                  </p>
                  <MultiSelect
                    opciones={opciones_estudiantes_disponibles}
                    seleccionados={estudiantes_a_asignar}
                    onChange={set_estudiantes_a_asignar}
                    placeholder="Seleccionar estudiantes..."
                    className="w-full"
                  />
                  {opciones_estudiantes_disponibles.length === 0 && (
                     <p className="text-muted-foreground text-center text-sm p-4">
                        No hay estudiantes disponibles que cumplan los requisitos para este grupo.
                     </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cerrar</Button>
                </DialogClose>
                <Button 
                  onClick={manejarAsignarMultiplesEstudiantes}
                  disabled={cargando_asignacion || estudiantes_a_asignar.length === 0}
                >
                  {cargando_asignacion ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  Asignar ({estudiantes_a_asignar.length})
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default GestionGrupos;