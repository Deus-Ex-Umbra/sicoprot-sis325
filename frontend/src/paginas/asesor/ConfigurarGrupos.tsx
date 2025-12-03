import { useState, useEffect } from 'react';
import { Loader2, Settings, Calendar, Clock, Save, Users, GraduationCap, Briefcase } from 'lucide-react';
import { gruposApi } from '../../servicios/api';
import { type Grupo, Rol } from '../../tipos/usuario';
import { toast } from 'sonner';
import { cn } from '../../lib/utilidades';
import BarraLateral from '../../componentes/barra-lateral';
import BarraLateralAdmin from '../../componentes/barra-lateral-admin';
import { useAutenticacion } from '../../contextos/autenticacion-contexto';
import { Button } from '../../componentes/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../componentes/ui/card';
import { Badge } from '../../componentes/ui/badge';
import { Input } from '../../componentes/ui/input';
import { Label } from '../../componentes/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../../componentes/ui/alert';
import { Separator } from '../../componentes/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../componentes/ui/accordion';

interface GrupoConfigurable extends Grupo {
  fecha_limite_propuesta?: string;
  fecha_limite_perfil?: string;
  fecha_limite_proyecto?: string;
  dias_revision_asesor?: number;
  dias_correccion_estudiante?: number;
}

interface FormularioConfiguracion {
  fecha_limite_propuesta: string;
  fecha_limite_perfil: string;
  fecha_limite_proyecto: string;
  dias_revision_asesor: number;
  dias_correccion_estudiante: number;
}

const ConfigurarGrupos = () => {
  const [grupos, setGrupos] = useState<GrupoConfigurable[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState<number | null>(null);
  const [formularios, setFormularios] = useState<{ [key: number]: FormularioConfiguracion }>({});
  
  const { usuario } = useAutenticacion();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const esAdmin = usuario?.rol === Rol.Administrador;

  useEffect(() => {
    cargarGrupos();
  }, []);

  const cargarGrupos = async () => {
    try {
      setCargando(true);
      const data = await gruposApi.obtenerMisGruposAsesor();
      setGrupos(data);
      
      // Inicializar formularios con los datos actuales
      const formsIniciales: { [key: number]: FormularioConfiguracion } = {};
      data.forEach((grupo: GrupoConfigurable) => {
        formsIniciales[grupo.id] = {
          fecha_limite_propuesta: formatearFecha(grupo.fecha_limite_propuesta),
          fecha_limite_perfil: formatearFecha(grupo.fecha_limite_perfil),
          fecha_limite_proyecto: formatearFecha(grupo.fecha_limite_proyecto),
          dias_revision_asesor: grupo.dias_revision_asesor || 7,
          dias_correccion_estudiante: grupo.dias_correccion_estudiante || 14,
        };
      });
      setFormularios(formsIniciales);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los grupos');
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha?: string | Date) => {
    if (!fecha) return '';
    return new Date(fecha).toISOString().split('T')[0];
  };

  const actualizarFormulario = (grupoId: number, campo: keyof FormularioConfiguracion, valor: string | number) => {
    setFormularios(prev => ({
      ...prev,
      [grupoId]: {
        ...prev[grupoId],
        [campo]: valor,
      },
    }));
  };

  const guardarConfiguracion = async (grupoId: number) => {
    try {
      setGuardando(grupoId);
      const form = formularios[grupoId];
      
      await gruposApi.configurarGrupo(grupoId, {
        fecha_limite_propuesta: form.fecha_limite_propuesta || null,
        fecha_limite_perfil: form.fecha_limite_perfil || null,
        fecha_limite_proyecto: form.fecha_limite_proyecto || null,
        dias_revision_asesor: Number(form.dias_revision_asesor),
        dias_correccion_estudiante: Number(form.dias_correccion_estudiante),
      });
      
      toast.success('Configuración guardada exitosamente');
      await cargarGrupos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar la configuración');
    } finally {
      setGuardando(null);
    }
  };

  const renderTarjetaGrupo = (grupo: GrupoConfigurable) => {
    const form = formularios[grupo.id];
    if (!form) return null;

    const esTallerI = grupo.tipo === 'taller_grado_i';
    const esTallerII = grupo.tipo === 'taller_grado_ii';

    return (
      <Card key={grupo.id} className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {esTallerI ? (
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                ) : (
                  <Briefcase className="h-5 w-5 text-green-500" />
                )}
                {grupo.nombre}
              </CardTitle>
              <CardDescription className="mt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">
                    {esTallerI ? 'Taller de Grado I' : 'Taller de Grado II'}
                  </Badge>
                  <Badge variant={grupo.activo ? 'default' : 'secondary'}>
                    {grupo.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Badge variant="outline">
                    {grupo.periodo?.nombre}
                  </Badge>
                  <span className="text-sm flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {grupo.estudiantes?.length || 0} estudiantes
                  </span>
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fechas Límite */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-primary" />
              Fechas Límite de Entrega
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {esTallerI && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`propuesta-${grupo.id}`}>Fecha Límite Propuesta</Label>
                    <Input
                      id={`propuesta-${grupo.id}`}
                      type="date"
                      value={form.fecha_limite_propuesta}
                      onChange={(e) => actualizarFormulario(grupo.id, 'fecha_limite_propuesta', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Fecha máxima para entregar la propuesta inicial
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`perfil-${grupo.id}`}>Fecha Límite Perfil</Label>
                    <Input
                      id={`perfil-${grupo.id}`}
                      type="date"
                      value={form.fecha_limite_perfil}
                      onChange={(e) => actualizarFormulario(grupo.id, 'fecha_limite_perfil', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Fecha máxima para aprobar el perfil de tesis
                    </p>
                  </div>
                </>
              )}
              {esTallerII && (
                <div className="space-y-2">
                  <Label htmlFor={`proyecto-${grupo.id}`}>Fecha Límite Proyecto Final</Label>
                  <Input
                    id={`proyecto-${grupo.id}`}
                    type="date"
                    value={form.fecha_limite_proyecto}
                    onChange={(e) => actualizarFormulario(grupo.id, 'fecha_limite_proyecto', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Fecha máxima para completar el proyecto de grado
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Tiempos de Revisión */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-primary" />
              Tiempos de Revisión y Corrección
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`dias-revision-${grupo.id}`}>Días para Revisión (Asesor)</Label>
                <Input
                  id={`dias-revision-${grupo.id}`}
                  type="number"
                  min="1"
                  max="60"
                  value={form.dias_revision_asesor}
                  onChange={(e) => actualizarFormulario(grupo.id, 'dias_revision_asesor', Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Tiempo máximo que tiene el asesor para revisar documentos
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`dias-correccion-${grupo.id}`}>Días para Corrección (Estudiante)</Label>
                <Input
                  id={`dias-correccion-${grupo.id}`}
                  type="number"
                  min="1"
                  max="60"
                  value={form.dias_correccion_estudiante}
                  onChange={(e) => actualizarFormulario(grupo.id, 'dias_correccion_estudiante', Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Tiempo máximo que tiene el estudiante para realizar correcciones
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => guardarConfiguracion(grupo.id)}
              disabled={guardando === grupo.id}
            >
              {guardando === grupo.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  let contenidoPagina;

  if (cargando) {
    contenidoPagina = (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  } else if (error) {
    contenidoPagina = (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  } else if (grupos.length === 0) {
    contenidoPagina = (
      <Alert>
        <AlertTitle>Sin Grupos Asignados</AlertTitle>
        <AlertDescription>
          No tienes grupos asignados actualmente. Los grupos son creados por el administrador
          y luego puedes configurar las fechas límite y tiempos de revisión aquí.
        </AlertDescription>
      </Alert>
    );
  } else {
    const gruposTallerI = grupos.filter(g => g.tipo === 'taller_grado_i' && g.activo);
    const gruposTallerII = grupos.filter(g => g.tipo === 'taller_grado_ii' && g.activo);
    const gruposInactivos = grupos.filter(g => !g.activo);

    contenidoPagina = (
      <div className="space-y-8">
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertTitle>Configuración de Grupos</AlertTitle>
          <AlertDescription>
            Aquí puedes establecer las fechas límite de entrega y los tiempos de revisión/corrección
            para cada uno de tus grupos. Estas configuraciones afectan el cronograma de tus estudiantes.
          </AlertDescription>
        </Alert>

        {gruposTallerI.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
              <GraduationCap className="h-6 w-6 text-blue-500" />
              Taller de Grado I (Propuesta / Perfil)
            </h2>
            {gruposTallerI.map(renderTarjetaGrupo)}
          </section>
        )}

        {gruposTallerII.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
              <Briefcase className="h-6 w-6 text-green-500" />
              Taller de Grado II (Proyecto Final)
            </h2>
            {gruposTallerII.map(renderTarjetaGrupo)}
          </section>
        )}

        {gruposInactivos.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="inactivos">
              <AccordionTrigger>
                <span className="text-muted-foreground">
                  Grupos Inactivos ({gruposInactivos.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {gruposInactivos.map(renderTarjetaGrupo)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {esAdmin ? (
        <BarraLateralAdmin isOpen={sidebarOpen} />
      ) : (
        <BarraLateral isOpen={sidebarOpen} />
      )}

      <main
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-0'
        )}
      >
        <div className="container mx-auto p-6 max-w-5xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              Configurar Mis Grupos
            </h1>
            <p className="text-muted-foreground mt-2">
              Establece las fechas límite y tiempos de revisión para tus grupos de estudiantes
            </p>
          </div>
          
          {contenidoPagina}
        </div>
      </main>
    </div>
  );
};

export default ConfigurarGrupos;
