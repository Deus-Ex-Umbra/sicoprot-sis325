import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { adminApi } from '../../servicios/api';
import { type Usuario, EstadoUsuario, Rol } from '../../tipos/usuario';
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
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';
import BarraLateral from '../../componentes/barra-lateral';

const GestionUsuarios = () => {
  const [usuarios, set_usuarios] = useState<Usuario[]>([]);
  const [usuarios_filtrados, set_usuarios_filtrados] = useState<Usuario[]>([]);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');

  const [mostrar_modal, set_mostrar_modal] = useState(false);
  const [usuario_seleccionado, set_usuario_seleccionado] = useState<Usuario | null>(null);
  const [nuevo_estado, set_nuevo_estado] = useState<EstadoUsuario>(EstadoUsuario.Activo);

  const [filtros, set_filtros] = useState({
    busqueda: '',
    rol: '',
    estado: '',
    grupo: ''
  });

  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);
  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, usuarios]);

  const cargarUsuarios = async () => {
    try {
      const data = await adminApi.obtenerTodosUsuarios();
      set_usuarios(data);
      set_usuarios_filtrados(data);
    } catch (err) {
      set_error('Error al cargar los usuarios');
    } finally {
      set_cargando(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...usuarios];

    if (filtros.busqueda) {
      const busqueda_lower = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(usuario =>
        usuario.correo.toLowerCase().includes(busqueda_lower) ||
        (usuario.perfil?.nombre?.toLowerCase().includes(busqueda_lower)) ||
        (usuario.perfil?.apellido?.toLowerCase().includes(busqueda_lower))
      );
    }

    if (filtros.rol) {
      resultado = resultado.filter(usuario => usuario.rol === filtros.rol);
    }

    if (filtros.estado) {
      resultado = resultado.filter(usuario => usuario.estado === filtros.estado);
    }

    if (filtros.grupo === 'con_grupo') {
      resultado = resultado.filter(usuario =>
        usuario.rol === Rol.Estudiante && usuario.perfil?.grupo
      );
    } else if (filtros.grupo === 'sin_grupo') {
      resultado = resultado.filter(usuario =>
        usuario.rol === Rol.Estudiante && !usuario.perfil?.grupo
      );
    }

    set_usuarios_filtrados(resultado);
  };

  const limpiarFiltros = () => {
    set_filtros({
      busqueda: '',
      rol: '',
      estado: '',
      grupo: ''
    });
  };

  const abrirModalCambiarEstado = (usuario: Usuario) => {
    set_usuario_seleccionado(usuario);
    set_nuevo_estado(usuario.estado);
    set_mostrar_modal(true);
  };

  const manejarCambiarEstado = async () => {
    if (!usuario_seleccionado) return;

    try {
      await adminApi.cambiarEstadoUsuario(usuario_seleccionado.id, { estado: nuevo_estado });
      toast.success('Estado actualizado exitosamente');
      set_mostrar_modal(false);
      await cargarUsuarios();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const obtenerBadgeEstado = (estado: EstadoUsuario) => {
    switch (estado) {
      case EstadoUsuario.Activo:
        return <Badge variant="default">Activo</Badge>;
      case EstadoUsuario.Pendiente:
        return <Badge variant="secondary" className="bg-yellow-500 text-black">Pendiente</Badge>;
      case EstadoUsuario.Inactivo:
        return <Badge variant="secondary">Inactivo</Badge>;
      case EstadoUsuario.Eliminado:
        return <Badge variant="destructive">Eliminado</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const obtenerBadgeRol = (rol: Rol) => {
    switch (rol) {
      case Rol.Estudiante:
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Estudiante</Badge>;
      case Rol.Asesor:
        return <Badge variant="outline" className="text-cyan-500 border-cyan-500">Asesor</Badge>;
      case Rol.Administrador:
        return <Badge variant="destructive">Administrador</Badge>;
      default:
        return <Badge variant="secondary">{rol}</Badge>;
    }
  };

  const hay_filtros_activos = filtros.busqueda || filtros.rol || filtros.estado || filtros.grupo;

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
            <CardTitle>Filtros de Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="busqueda">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="busqueda"
                    type="text"
                    placeholder="Nombre, apellido o correo..."
                    value={filtros.busqueda}
                    onChange={(e) => set_filtros({ ...filtros, busqueda: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <Select
                  value={filtros.rol}
                  onValueChange={(value) => set_filtros({ ...filtros, rol: value === 'todos-roles' ? '' : value })}
                >
                  <SelectTrigger id="rol">
                    <SelectValue placeholder="Todos los roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos-roles">Todos los roles</SelectItem>
                    <SelectItem value={Rol.Estudiante}>Estudiante</SelectItem>
                    <SelectItem value={Rol.Asesor}>Asesor</SelectItem>
                    <SelectItem value={Rol.Administrador}>Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={filtros.estado}
                  onValueChange={(value) => set_filtros({ ...filtros, estado: value === 'todos-estados' ? '' : value })}
                >
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos-estados">Todos los estados</SelectItem>
                    <SelectItem value={EstadoUsuario.Activo}>Activo</SelectItem>
                    {/* <SelectItem value={EstadoUsuario.Pendiente}>Pendiente</SelectItem> */}
                    <SelectItem value={EstadoUsuario.Inactivo}>Inactivo</SelectItem>
                    <SelectItem value={EstadoUsuario.Eliminado}>Eliminado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grupo">Grupo (Estudiantes)</Label>
                <Select
                  value={filtros.grupo}
                  onValueChange={(value) => set_filtros({ ...filtros, grupo: value === 'todos-grupos' ? '' : value })}
                >
                  <SelectTrigger id="grupo">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos-grupos">Todos</SelectItem>
                    <SelectItem value="con_grupo">Con grupo asignado</SelectItem>
                    <SelectItem value="sin_grupo">Sin grupo asignado</SelectItem>
                  </SelectContent>
                </Select>
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
                  Mostrando {usuarios_filtrados.length} de {usuarios.length} usuarios
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Grupo/Info</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios_filtrados.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>{usuario.id}</TableCell>
                    <TableCell>
                      {usuario.perfil
                        ? `${usuario.perfil.nombre} ${usuario.perfil.apellido}`
                        : 'Sin perfil'
                      }
                    </TableCell>
                    <TableCell>{usuario.correo}</TableCell>
                    <TableCell>{obtenerBadgeRol(usuario.rol)}</TableCell>
                    <TableCell>{obtenerBadgeEstado(usuario.estado)}</TableCell>
                    <TableCell>
                      {usuario.rol === Rol.Estudiante && usuario.perfil?.grupo && (
                        <Badge variant="outline">{usuario.perfil.grupo.nombre}</Badge>
                      )}
                      {usuario.rol === Rol.Estudiante && !usuario.perfil?.grupo && (
                        <Badge variant="secondary">Sin grupo</Badge>
                      )}
                      {usuario.rol === Rol.Asesor && usuario.perfil?.grupos && (
                        <Badge variant="outline">{usuario.perfil.grupos.length} grupo(s)</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-xs">
                        {new Date(usuario.creado_en).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {usuario.rol !== Rol.Administrador && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirModalCambiarEstado(usuario)}
                        >
                          Cambiar Estado
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {usuarios_filtrados.length === 0 && (
              <p className="text-muted-foreground text-center py-10">
                {hay_filtros_activos
                  ? 'No se encontraron usuarios con los filtros aplicados.'
                  : 'No hay usuarios registrados.'}
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
          <h1 className="text-3xl font-bold tracking-tight mb-6">Gestión de Usuarios</h1>
          {contenido_pagina}

          <Dialog open={mostrar_modal} onOpenChange={set_mostrar_modal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cambiar Estado de Usuario</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {usuario_seleccionado && (
                  <>
                    <p>
                      <strong>Usuario:</strong> {usuario_seleccionado.perfil?.nombre} {usuario_seleccionado.perfil?.apellido}
                    </p>
                    <p>
                      <strong>Correo:</strong> {usuario_seleccionado.correo}
                    </p>
                    <div className="flex items-center gap-2">
                      <strong>Estado actual:</strong> {obtenerBadgeEstado(usuario_seleccionado.estado)}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nuevo_estado">Nuevo Estado</Label>
                      <Select
                        value={nuevo_estado}
                        onValueChange={(value) => set_nuevo_estado(value as EstadoUsuario)}
                      >
                        <SelectTrigger id="nuevo_estado">
                          <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={EstadoUsuario.Activo}>Activo</SelectItem>
                          <SelectItem value={EstadoUsuario.Inactivo}>Inactivo</SelectItem>
                          <SelectItem value={EstadoUsuario.Eliminado}>Eliminado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button variant="default" onClick={manejarCambiarEstado}>
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default GestionUsuarios;