import { useState, useEffect } from 'react';
import { Plus, Edit, Trash, CheckCircle, Loader2 } from 'lucide-react';
import { periodosApi } from '../../servicios/api';
import { type Periodo } from '../../tipos/usuario';
import { toast } from 'sonner';
import { cn } from '../../lib/utilidades';
import Cabecera from '../../componentes/Cabecera';
import BarraLateralAdmin from '../../componentes/BarraLateralAdmin';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
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
import { Switch } from '../../componentes/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';
import { Textarea } from '../../componentes/ui/textarea';
import BarraLateral from '../../componentes/BarraLateral';

const GestionPeriodos = () => {
  const [periodos, set_periodos] = useState<Periodo[]>([]);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  const [mostrar_modal, set_mostrar_modal] = useState(false);
  const [periodo_editando, set_periodo_editando] = useState<Periodo | null>(null);
  const [form_periodo, set_form_periodo] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio_semestre: '',
    fecha_fin_semestre: '',
    fecha_inicio_inscripciones: '',
    fecha_fin_inscripciones: '',
    activo: false,
  });

  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);
  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    cargarPeriodos();
  }, []);

  const cargarPeriodos = async () => {
    try {
      const data = await periodosApi.obtenerTodos();
      set_periodos(data);
    } catch (err) {
      set_error('Error al cargar los períodos');
    } finally {
      set_cargando(false);
    }
  };

  const abrirModalCrear = () => {
    set_periodo_editando(null);
    set_form_periodo({
      nombre: '',
      descripcion: '',
      fecha_inicio_semestre: '',
      fecha_fin_semestre: '',
      fecha_inicio_inscripciones: '',
      fecha_fin_inscripciones: '',
      activo: false,
    });
    set_mostrar_modal(true);
  };

  const abrirModalEditar = (periodo: Periodo) => {
    set_periodo_editando(periodo);
    set_form_periodo({
      nombre: periodo.nombre,
      descripcion: periodo.descripcion || '',
      fecha_inicio_semestre: periodo.fecha_inicio_semestre.split('T')[0],
      fecha_fin_semestre: periodo.fecha_fin_semestre.split('T')[0],
      fecha_inicio_inscripciones: periodo.fecha_inicio_inscripciones.split('T')[0],
      fecha_fin_inscripciones: periodo.fecha_fin_inscripciones.split('T')[0],
      activo: periodo.activo,
    });
    set_mostrar_modal(true);
  };

  const manejarGuardar = async () => {
    try {
      if (periodo_editando) {
        await periodosApi.actualizar(periodo_editando.id, form_periodo);
        toast.success('Período actualizado exitosamente');
      } else {
        await periodosApi.crear(form_periodo);
        toast.success('Período creado exitosamente');
      }
      set_mostrar_modal(false);
      await cargarPeriodos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar período');
    }
  };

  const manejarEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este período?')) return;

    try {
      await periodosApi.eliminar(id);
      toast.success('Período eliminado exitosamente');
      await cargarPeriodos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar período');
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
    contenido_pagina = <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
  } else {
    contenido_pagina = (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Períodos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Semestre</TableHead>
                <TableHead>Inscripciones</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Grupos</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periodos.map((periodo) => (
                <TableRow key={periodo.id}>
                  <TableCell className="font-medium">
                    {periodo.nombre}
                    {periodo.activo && (
                      <Badge className="ml-2">
                        <CheckCircle className="h-3 w-3 mr-1" /> Activo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{periodo.descripcion || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(periodo.fecha_inicio_semestre).toLocaleDateString()} - 
                    {new Date(periodo.fecha_fin_semestre).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(periodo.fecha_inicio_inscripciones).toLocaleDateString()} - 
                    {new Date(periodo.fecha_fin_inscripciones).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={periodo.activo ? 'default' : 'secondary'}>
                      {periodo.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{periodo.grupos?.length || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => abrirModalEditar(periodo)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => manejarEliminar(periodo.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {periodos.length === 0 && (
            <p className="text-muted-foreground text-center py-10">
              No hay períodos registrados.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Cabecera toggleSidebar={toggleSidebar} />
      {es_admin ? (
        <BarraLateralAdmin isOpen={sidebar_open} />
      ) : (
        <BarraLateral isOpen={sidebar_open} />
      )}

      <main
        className={cn(
          'transition-all duration-300 pt-14',
          sidebar_open ? 'ml-64' : 'ml-0'
        )}
      >
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Períodos</h1>
            <Button onClick={abrirModalCrear}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Período
            </Button>
          </div>

          {contenido_pagina}

          <Dialog open={mostrar_modal} onOpenChange={set_mostrar_modal}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{periodo_editando ? 'Editar' : 'Crear'} Período</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={form_periodo.nombre}
                      onChange={(e) => set_form_periodo({ ...form_periodo, nombre: e.target.value })}
                      placeholder="Ej: 2025-1"
                    />
                  </div>
                  <div className="space-y-2 pt-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="activo"
                        checked={form_periodo.activo}
                        onCheckedChange={(checked) => set_form_periodo({ ...form_periodo, activo: checked })}
                      />
                      <Label htmlFor="activo">Período Activo</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Solo puede haber un período activo a la vez.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={form_periodo.descripcion}
                    onChange={(e) => set_form_periodo({ ...form_periodo, descripcion: e.target.value })}
                    placeholder="Descripción del período"
                  />
                </div>

                <h6 className="font-semibold">Fechas del Semestre</h6>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_inicio_semestre">Inicio Semestre</Label>
                    <Input
                      id="fecha_inicio_semestre"
                      type="date"
                      value={form_periodo.fecha_inicio_semestre}
                      onChange={(e) => set_form_periodo({ ...form_periodo, fecha_inicio_semestre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_fin_semestre">Fin Semestre</Label>
                    <Input
                      id="fecha_fin_semestre"
                      type="date"
                      value={form_periodo.fecha_fin_semestre}
                      onChange={(e) => set_form_periodo({ ...form_periodo, fecha_fin_semestre: e.target.value })}
                    />
                  </div>
                </div>

                <h6 className="font-semibold">Fechas de Inscripciones</h6>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_inicio_inscripciones">Inicio Inscripciones</Label>
                    <Input
                      id="fecha_inicio_inscripciones"
                      type="date"
                      value={form_periodo.fecha_inicio_inscripciones}
                      onChange={(e) => set_form_periodo({ ...form_periodo, fecha_inicio_inscripciones: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_fin_inscripciones">Fin Inscripciones</Label>
                    <Input
                      id="fecha_fin_inscripciones"
                      type="date"
                      value={form_periodo.fecha_fin_inscripciones}
                      onChange={(e) => set_form_periodo({ ...form_periodo, fecha_fin_inscripciones: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={manejarGuardar}>
                  {periodo_editando ? 'Actualizar' : 'Crear'} Período
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default GestionPeriodos;