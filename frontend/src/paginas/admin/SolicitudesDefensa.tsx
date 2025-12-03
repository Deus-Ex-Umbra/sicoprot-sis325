import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, User, FileText, Calendar, Eye, Filter, Plus, Award } from 'lucide-react';
import { proyectosApi, documentosApi, asesoresApi, defensasApi } from '../../servicios/api';
import { type Proyecto, Rol, type Asesor, type Usuario, TipoDefensa } from '../../tipos/usuario';
import { toast } from 'sonner';
import { cn } from '../../lib/utilidades';
import BarraLateralAdmin from '../../componentes/barra-lateral-admin';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Button } from '../../componentes/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../componentes/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../componentes/ui/table';
import { Badge } from '../../componentes/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';
import BarraLateral from '../../componentes/barra-lateral';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../componentes/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../../componentes/ui/dialog';
import { Input } from '../../componentes/ui/input';
import { Label } from '../../componentes/ui/label';
import { Textarea } from '../../componentes/ui/textarea';
import { MultiSelect, type OpcionMultiSelect } from '../../componentes/ui/multi-select';

type FiltroEstado = 'pendientes' | 'aprobadas' | 'rechazadas';

const SolicitudesDefensa = () => {
  const [solicitudes, set_solicitudes] = useState<Proyecto[]>([]);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');
  const [filtro_estado, set_filtro_estado] = useState<FiltroEstado>('pendientes');
  
  const { usuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);
  const es_admin = usuario?.rol === Rol.Administrador;
  const navigate = useNavigate();

  // Estados para el modal de crear pre-defensa manualmente
  const [modal_predefensa, set_modal_predefensa] = useState(false);
  const [proyecto_seleccionado, set_proyecto_seleccionado] = useState<Proyecto | null>(null);
  const [asesores_disponibles, set_asesores_disponibles] = useState<Usuario[]>([]);
  const [cargando_asesores, set_cargando_asesores] = useState(false);
  const [enviando_predefensa, set_enviando_predefensa] = useState(false);
  const [form_predefensa, set_form_predefensa] = useState({
    fecha_programada: '',
    lugar: '',
    enlace: '',
    ids_tribunales: [] as string[],
  });

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  useEffect(() => {
    cargarSolicitudes();
  }, [filtro_estado]);

  const cargarSolicitudes = async () => {
    try {
      set_cargando(true);
      const data = await proyectosApi.obtenerSolicitudesDefensa(filtro_estado);
      set_solicitudes(data);
    } catch (err: any) {
      set_error(err.response?.data?.message || 'Error al cargar las solicitudes de defensa');
    } finally {
      set_cargando(false);
    }
  };

  // Cargar asesores para el tribunal
  const cargarAsesores = async (proyecto: Proyecto) => {
    set_cargando_asesores(true);
    try {
      const data = await asesoresApi.obtenerTodos();
      // Filtrar para excluir al asesor del proyecto
      const asesores_filtrados = data.filter((a: Usuario) => 
        a.perfil?.id_asesor !== proyecto.asesor?.id
      );
      set_asesores_disponibles(asesores_filtrados);
    } catch (error) {
      console.error('Error cargando asesores:', error);
      toast.error('Error al cargar la lista de asesores');
    } finally {
      set_cargando_asesores(false);
    }
  };

  const abrirModalPredefensa = (proyecto: Proyecto) => {
    set_proyecto_seleccionado(proyecto);
    set_form_predefensa({
      fecha_programada: '',
      lugar: '',
      enlace: '',
      ids_tribunales: [],
    });
    set_modal_predefensa(true);
    cargarAsesores(proyecto);
  };

  const opciones_tribunales: OpcionMultiSelect[] = asesores_disponibles.map(a => ({
    value: String(a.perfil?.id_asesor),
    label: `${a.perfil?.nombre} ${a.perfil?.apellido}`
  }));

  const manejarCrearPredefensa = async () => {
    if (!proyecto_seleccionado) return;

    if (form_predefensa.ids_tribunales.length < 3) {
      toast.error('Debe seleccionar al menos 3 miembros del tribunal');
      return;
    }
    if (!form_predefensa.fecha_programada) {
      toast.error('Debe especificar una fecha para la pre-defensa');
      return;
    }

    set_enviando_predefensa(true);
    try {
      const ids_tribunales = form_predefensa.ids_tribunales.map(id => parseInt(id));
      
      // Validar tribunal
      const validacion = await defensasApi.validarTribunal(proyecto_seleccionado.id, ids_tribunales);
      if (!validacion.valido) {
        toast.error(validacion.errores.join(', '));
        set_enviando_predefensa(false);
        return;
      }

      await defensasApi.programarDefensa({
        id_proyecto: proyecto_seleccionado.id,
        fecha_programada: form_predefensa.fecha_programada,
        lugar: form_predefensa.lugar,
        enlace: form_predefensa.enlace,
        tipo: TipoDefensa.PRE_DEFENSA,
        ids_tribunales,
      });

      toast.success('Pre-defensa creada exitosamente');
      set_modal_predefensa(false);
      cargarSolicitudes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear la pre-defensa');
    } finally {
      set_enviando_predefensa(false);
    }
  };

  const getBadgeEstado = (proyecto: Proyecto) => {
    // Si está en pre_defensa, en_defensa o terminado, significa que el memorial fue aceptado
    if (proyecto.etapa_actual === 'pre_defensa' || 
        proyecto.etapa_actual === 'en_defensa' || 
        proyecto.etapa_actual === 'terminado') {
      return <Badge variant="default" className="bg-green-600">Aceptada</Badge>;
    }
    // Si volvió a listo_defensa con comentarios, fue rechazada
    if (proyecto.etapa_actual === 'listo_defensa' && proyecto.comentarios_defensa) {
      return <Badge variant="destructive">Rechazada</Badge>;
    }
    return <Badge variant="secondary">Pendiente</Badge>;
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
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Proyecto</TableHead>
                <TableHead>Título del Proyecto</TableHead>
                <TableHead>Estudiante(s)</TableHead>
                <TableHead>Asesor</TableHead>
                <TableHead>Memorial</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.map((proyecto) => (
                <TableRow key={proyecto.id}>
                  <TableCell>{proyecto.id}</TableCell>
                  <TableCell className="font-medium">{proyecto.titulo}</TableCell>
                  <TableCell>
                    {proyecto.estudiantes?.map(e => `${e.nombre} ${e.apellido}`).join(', ') || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {proyecto.asesor ? `${proyecto.asesor.nombre} ${proyecto.asesor.apellido}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {proyecto.ruta_memorial ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={documentosApi.obtenerArchivoPorRutaUrl(proyecto.ruta_memorial)} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-1" /> Ver PDF
                        </a>
                      </Button>
                    ) : (
                      <Badge variant="destructive">Sin Memorial</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {getBadgeEstado(proyecto)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/panel/proyecto/${proyecto.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> 
                        {filtro_estado === 'pendientes' ? 'Responder' : 'Ver'}
                      </Button>
                      
                      {/* Botón para crear pre-defensa manualmente (solo en aprobadas) */}
                      {filtro_estado === 'aprobadas' && proyecto.etapa_actual === 'pre_defensa' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirModalPredefensa(proyecto)}
                          title="Crear pre-defensa manualmente (en caso de problemas)"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Pre-Defensa
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {solicitudes.length === 0 && (
            <p className="text-muted-foreground text-center py-10">
              No hay solicitudes de defensa en estado "{filtro_estado}".
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
  <div
    className="min-h-screen"
    style={{
      backgroundColor: 'hsl(var(--background) / 1)',
    }}
  >
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
          <h1 className="text-3xl font-bold tracking-tight">
            Solicitudes de Defensa
          </h1>
        </div>

        <Tabs defaultValue="pendientes" onValueChange={(value) => set_filtro_estado(value as FiltroEstado)}>
          <TabsList className="mb-4">
            <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
            <TabsTrigger value="aprobadas">Aprobadas</TabsTrigger>
            <TabsTrigger value="rechazadas">Rechazadas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pendientes">{contenido_pagina}</TabsContent>
          <TabsContent value="aprobadas">{contenido_pagina}</TabsContent>
          <TabsContent value="rechazadas">{contenido_pagina}</TabsContent>
        </Tabs>

      </div>
    </main>

    {/* Modal para crear pre-defensa manualmente */}
    <Dialog open={modal_predefensa} onOpenChange={set_modal_predefensa}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Pre-Defensa Manualmente</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Alert>
            <AlertDescription>
              Use esta opción si la pre-defensa no se creó automáticamente al aprobar la solicitud. 
              Se programará una pre-defensa para el proyecto seleccionado.
            </AlertDescription>
          </Alert>

          {proyecto_seleccionado && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-medium">{proyecto_seleccionado.titulo}</p>
              <p className="text-sm text-muted-foreground">
                Estudiante(s): {proyecto_seleccionado.estudiantes?.map(e => `${e.nombre} ${e.apellido}`).join(', ') || 'N/A'}
              </p>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Programar Pre-Defensa
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha-predefensa-modal">Fecha y Hora *</Label>
                <Input
                  id="fecha-predefensa-modal"
                  type="datetime-local"
                  value={form_predefensa.fecha_programada}
                  onChange={(e) => set_form_predefensa({ ...form_predefensa, fecha_programada: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lugar-predefensa-modal">Lugar</Label>
                <Input
                  id="lugar-predefensa-modal"
                  placeholder="Ej: Aula 201, Edificio A"
                  value={form_predefensa.lugar}
                  onChange={(e) => set_form_predefensa({ ...form_predefensa, lugar: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="enlace-predefensa-modal">Enlace Virtual (opcional)</Label>
              <Input
                id="enlace-predefensa-modal"
                placeholder="https://meet.google.com/..."
                value={form_predefensa.enlace}
                onChange={(e) => set_form_predefensa({ ...form_predefensa, enlace: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Tribunal (mínimo 3 docentes) *
            </h4>
            
            {cargando_asesores ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando asesores...</span>
              </div>
            ) : (
              <>
                <MultiSelect
                  opciones={opciones_tribunales}
                  seleccionados={form_predefensa.ids_tribunales}
                  onChange={(valores) => set_form_predefensa({ ...form_predefensa, ids_tribunales: valores })}
                  placeholder="Seleccionar miembros del tribunal..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Seleccionados: {form_predefensa.ids_tribunales.length} de mínimo 3
                  {proyecto_seleccionado?.asesor && (
                    <span className="ml-2">(El asesor del proyecto ha sido excluido automáticamente)</span>
                  )}
                </p>
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button 
            onClick={manejarCrearPredefensa}
            disabled={form_predefensa.ids_tribunales.length < 3 || !form_predefensa.fecha_programada || enviando_predefensa}
          >
            {enviando_predefensa ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Pre-Defensa'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
);

};

export default SolicitudesDefensa;