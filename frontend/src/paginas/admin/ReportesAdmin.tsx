import { useState, useEffect } from 'react';
import { reportesApi } from '../../servicios/api';
import BarraLateralAdmin from '../../componentes/barra-lateral-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../componentes/ui/card';
import { Progress } from '../../componentes/ui/progress';
import { Loader2, BarChart3, Clock, Plus, FileText, Trash2, Eye, Save } from 'lucide-react';
import { Button } from '../../componentes/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../componentes/ui/dialog';
import { Input } from '../../componentes/ui/input';
import { Label } from '../../componentes/ui/label';
import { toast } from 'sonner';
import { ScrollArea } from '../../componentes/ui/scroll-area';

interface ReporteGuardado {
  id: string;
  nombre: string;
  fecha: string;
  datos: {
    avances: any[];
    tiempos: any[];
  };
}

const ReportesAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [vistaActual, setVistaActual] = useState<'lista' | 'generar' | 'ver'>('lista');
  
  // Estado para generar reporte
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [datosGenerados, setDatosGenerados] = useState<{avances: any[], tiempos: any[]} | null>(null);
  const [nombreReporte, setNombreReporte] = useState('');
  
  // Estado para lista de reportes
  const [reportesGuardados, setReportesGuardados] = useState<ReporteGuardado[]>([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteGuardado | null>(null);

  useEffect(() => {
    const guardados = localStorage.getItem('reportes_guardados');
    if (guardados) {
      setReportesGuardados(JSON.parse(guardados));
    }
  }, []);

  const generarDatosReporte = async () => {
    setCargandoDatos(true);
    try {
      const [avancesData, tiemposData] = await Promise.all([
        reportesApi.obtenerAvanceGrupos(),
        reportesApi.obtenerTiemposRevision()
      ]);
      setDatosGenerados({ avances: avancesData, tiempos: tiemposData });
      setVistaActual('generar');
    } catch (error) {
      console.error(error);
      toast.error('Error al obtener datos del sistema');
    } finally {
      setCargandoDatos(false);
    }
  };

  const guardarReporte = () => {
    if (!nombreReporte.trim()) {
      toast.error('Debe asignar un nombre al reporte');
      return;
    }
    if (!datosGenerados) return;

    const nuevoReporte: ReporteGuardado = {
      id: Date.now().toString(),
      nombre: nombreReporte,
      fecha: new Date().toISOString(),
      datos: datosGenerados
    };

    const nuevosReportes = [nuevoReporte, ...reportesGuardados];
    setReportesGuardados(nuevosReportes);
    localStorage.setItem('reportes_guardados', JSON.stringify(nuevosReportes));
    
    toast.success('Reporte guardado exitosamente');
    setNombreReporte('');
    setDatosGenerados(null);
    setVistaActual('lista');
  };

  const verReporte = (reporte: ReporteGuardado) => {
    setReporteSeleccionado(reporte);
    setVistaActual('ver');
  };

  const eliminarReporte = (id: string) => {
    if (!confirm('¿Está seguro de eliminar este reporte?')) return;
    const nuevosReportes = reportesGuardados.filter(r => r.id !== id);
    setReportesGuardados(nuevosReportes);
    localStorage.setItem('reportes_guardados', JSON.stringify(nuevosReportes));
    toast.success('Reporte eliminado');
    if (reporteSeleccionado?.id === id) {
      setVistaActual('lista');
      setReporteSeleccionado(null);
    }
  };

  const VistaVisualizacion = ({ datos, titulo, fecha }: { datos: {avances: any[], tiempos: any[]}, titulo: string, fecha?: string }) => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{titulo}</h2>
          {fecha && <p className="text-muted-foreground">Generado el: {new Date(fecha).toLocaleString()}</p>}
        </div>
        <Button variant="outline" onClick={() => setVistaActual('lista')}>Volver a la lista</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Avance Promedio por Grupo
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                      {datos.avances.map((grupo, index) => (
                          <div key={index} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                  <span className="font-medium">{grupo.nombre}</span>
                                  <span className="text-muted-foreground">{grupo.avance}%</span>
                              </div>
                              <Progress value={grupo.avance} className="h-2" />
                          </div>
                      ))}
                      {datos.avances.length === 0 && <p className="text-muted-foreground">No hay datos disponibles.</p>}
                  </div>
                </ScrollArea>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Tiempos de Revisión (Días)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                      {datos.tiempos.map((grupo, index) => (
                          <div key={index} className="flex justify-between items-center border-b border-border pb-2 last:border-0">
                              <span className="font-medium">{grupo.nombre}</span>
                              <span className="text-primary font-bold">{grupo.tiempoPromedio} días</span>
                          </div>
                      ))}
                      {datos.tiempos.length === 0 && <p className="text-muted-foreground">No hay datos disponibles.</p>}
                  </div>
                </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background text-foreground">
      <BarraLateralAdmin isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden ml-64 transition-all duration-300">
        <header className="bg-card border-b border-border shadow-sm z-10 p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Reportes y Estadísticas</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
            
            {vistaActual === 'lista' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Reportes Guardados</h2>
                  <Button onClick={generarDatosReporte} disabled={cargandoDatos}>
                    {cargandoDatos ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Generar Nuevo Reporte
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportesGuardados.map((reporte) => (
                    <Card key={reporte.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          {reporte.nombre}
                        </CardTitle>
                        <CardDescription>
                          {new Date(reporte.fecha).toLocaleDateString()} - {new Date(reporte.fecha).toLocaleTimeString()}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" size="sm" onClick={() => eliminarReporte(reporte.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => verReporte(reporte)}>
                          <Eye className="mr-2 h-4 w-4" /> Ver
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  {reportesGuardados.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay reportes guardados.</p>
                      <p className="text-sm">Genere uno nuevo para comenzar.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {vistaActual === 'generar' && datosGenerados && (
              <div className="space-y-6">
                <Card className="bg-secondary/20 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-end gap-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="nombre-reporte">Nombre del Reporte</Label>
                        <Input 
                          id="nombre-reporte" 
                          placeholder="Ej: Reporte Final Gestión 2024" 
                          value={nombreReporte}
                          onChange={(e) => setNombreReporte(e.target.value)}
                        />
                      </div>
                      <Button onClick={guardarReporte}>
                        <Save className="mr-2 h-4 w-4" /> Guardar Reporte
                      </Button>
                      <Button variant="ghost" onClick={() => { setVistaActual('lista'); setDatosGenerados(null); }}>
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <VistaVisualizacion datos={datosGenerados} titulo="Vista Previa del Reporte" />
              </div>
            )}

            {vistaActual === 'ver' && reporteSeleccionado && (
              <VistaVisualizacion 
                datos={reporteSeleccionado.datos} 
                titulo={reporteSeleccionado.nombre} 
                fecha={reporteSeleccionado.fecha} 
              />
            )}

        </main>
      </div>
    </div>
  );
};

export default ReportesAdmin;
