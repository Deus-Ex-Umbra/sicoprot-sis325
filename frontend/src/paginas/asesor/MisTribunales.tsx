import { useState, useEffect } from 'react';
import { defensasApi } from '../../servicios/api';
import BarraLateral from '../../componentes/barra-lateral';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../componentes/ui/card';
import { Button } from '../../componentes/ui/button';
import { Badge } from '../../componentes/ui/badge';
import { Loader2, CheckCircle, MessageSquare, Award, Calendar, Clock, MapPin, Link, AlertTriangle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../componentes/ui/dialog';
import { Textarea } from '../../componentes/ui/textarea';
import { Input } from '../../componentes/ui/input';
import { Label } from '../../componentes/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../componentes/ui/tabs';
import { toast } from 'sonner';
import { TipoDefensa, EstadoDefensa, Defensa } from '../../tipos/usuario';

const MisTribunales = () => {
  const [defensas, setDefensas] = useState<Defensa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [modalOpinion, setModalOpinion] = useState(false);
  const [modalEvaluar, setModalEvaluar] = useState(false);
  const [defensaSeleccionada, setDefensaSeleccionada] = useState<Defensa | null>(null);
  const [opinion, setOpinion] = useState('');
  const [nota, setNota] = useState('');
  const [comentarioEvaluacion, setComentarioEvaluacion] = useState('');
  const [observacionesPublicas, setObservacionesPublicas] = useState('');

  // Actualizar defensas cada 30 segundos para verificar estados automáticos
  useEffect(() => {
    const intervalo = setInterval(() => {
      cargarDefensas();
    }, 30000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    cargarDefensas();
  }, []);

  const cargarDefensas = async () => {
    try {
      const data = await defensasApi.obtenerMiTribunal();
      setDefensas(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar defensas');
    } finally {
      setCargando(false);
    }
  };

  const confirmarAsistencia = async (id: number) => {
    try {
      await defensasApi.confirmarAsistencia(id);
      toast.success('Asistencia confirmada correctamente');
      cargarDefensas();
    } catch (error: any) {
      const mensaje = error?.response?.data?.message || 'Error al confirmar asistencia';
      toast.error(mensaje);
    }
  };

  const enviarOpinion = async () => {
    if (!defensaSeleccionada) return;
    try {
      await defensasApi.emitirOpinion(defensaSeleccionada.id, { opinion });
      toast.success('Opinión enviada');
      setModalOpinion(false);
      setOpinion('');
      cargarDefensas();
    } catch (error) {
      toast.error('Error al enviar opinión');
    }
  };

  const enviarEvaluacion = async () => {
    if (!defensaSeleccionada) return;
    const notaNum = Number(nota);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 100) {
      toast.error('La nota debe estar entre 0 y 100');
      return;
    }
    try {
      // Para pre-defensa, incluir observaciones públicas
      const datos: any = { 
        calificacion: notaNum, 
        observaciones: comentarioEvaluacion 
      };
      
      // Solo agregar observaciones públicas si es pre-defensa
      if (defensaSeleccionada.tipo === TipoDefensa.PRE_DEFENSA && observacionesPublicas) {
        datos.observaciones_publicas = observacionesPublicas;
      }
      
      await defensasApi.calificarDefensa(defensaSeleccionada.id, datos);
      toast.success('Evaluación enviada correctamente');
      setModalEvaluar(false);
      setNota('');
      setComentarioEvaluacion('');
      setObservacionesPublicas('');
      cargarDefensas();
    } catch (error: any) {
      const mensaje = error?.response?.data?.message || 'Error al enviar evaluación';
      toast.error(mensaje);
    }
  };

  const obtenerBadgeTipo = (tipo: TipoDefensa) => {
    switch (tipo) {
      case TipoDefensa.PRE_DEFENSA:
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Pre-Defensa</Badge>;
      case TipoDefensa.DEFENSA:
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Defensa</Badge>;
      default:
        return <Badge>{tipo}</Badge>;
    }
  };

  const obtenerBadgeEstado = (estado: EstadoDefensa) => {
    switch (estado) {
      case EstadoDefensa.PROGRAMADA:
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Programada</Badge>;
      case EstadoDefensa.EN_CURSO:
        return <Badge variant="outline" className="border-green-500 text-green-600 animate-pulse">En Curso</Badge>;
      case EstadoDefensa.FINALIZADA:
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Finalizada - Pendiente Calificar</Badge>;
      case EstadoDefensa.APROBADA:
        return <Badge className="bg-green-600">Aprobada</Badge>;
      case EstadoDefensa.REPROBADA:
        return <Badge variant="destructive">Reprobada</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const filtrarPorTipo = (tipo: TipoDefensa) => {
    return defensas.filter(d => d.tipo === tipo && (
      d.estado === EstadoDefensa.PROGRAMADA || 
      d.estado === EstadoDefensa.EN_CURSO ||
      d.estado === EstadoDefensa.FINALIZADA
    ));
  };

  const defensasFinalizadas = defensas.filter(d => d.estado === EstadoDefensa.APROBADA || d.estado === EstadoDefensa.REPROBADA);

  const renderDefensa = (defensa: Defensa) => {
    const miParticipacion = defensa.mi_participacion;
    
    // Estados de la defensa
    const estaProgramada = defensa.estado === EstadoDefensa.PROGRAMADA;
    const estaEnCurso = defensa.estado === EstadoDefensa.EN_CURSO;
    const estaFinalizada = defensa.estado === EstadoDefensa.FINALIZADA;
    const estaAprobadaOReprobada = defensa.estado === EstadoDefensa.APROBADA || defensa.estado === EstadoDefensa.REPROBADA;
    
    // Solo puede confirmar asistencia si la defensa está EN_CURSO y no ha confirmado aún
    const puedeConfirmarAsistencia = estaEnCurso && !miParticipacion?.asistencia_confirmada;
    
    // Puede calificar si ha confirmado asistencia, la defensa está EN_CURSO o FINALIZADA, y no ha calificado aún
    const puedeCalificar = (estaEnCurso || estaFinalizada) && miParticipacion?.asistencia_confirmada && !miParticipacion?.ha_calificado;
    
    return (
      <Card key={defensa.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{defensa.proyecto?.titulo}</CardTitle>
              <CardDescription>
                {defensa.proyecto?.estudiantes?.[0]?.nombre} {defensa.proyecto?.estudiantes?.[0]?.apellido}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-1 items-end">
              {obtenerBadgeTipo(defensa.tipo)}
              {obtenerBadgeEstado(defensa.estado)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {defensa.fecha_programada 
                ? new Date(defensa.fecha_programada).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Fecha pendiente'}
            </span>
          </div>
          {defensa.fecha_programada && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(defensa.fecha_programada).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
          {defensa.lugar && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{defensa.lugar}</span>
            </div>
          )}
          {defensa.enlace && (
            <div className="flex items-center gap-2 text-sm">
              <Link className="h-4 w-4 text-muted-foreground" />
              <a href={defensa.enlace} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Enlace virtual
              </a>
            </div>
          )}
          
          <div className="border-t pt-3 mt-3">
            {/* Estado: PROGRAMADA - Esperando inicio automático */}
            {estaProgramada && (
              <div className="flex items-center text-amber-600 text-sm gap-2">
                <AlertTriangle className="h-4 w-4" /> 
                <span>La defensa iniciará automáticamente en la fecha y hora programada</span>
              </div>
            )}
            
            {/* Estado: EN_CURSO - Puede confirmar asistencia */}
            {estaEnCurso && (
              miParticipacion?.asistencia_confirmada ? (
                <div className="flex items-center text-green-600 text-sm gap-2 mb-2">
                  <CheckCircle className="h-4 w-4" /> Asistencia Confirmada - Puede calificar ahora
                </div>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={() => confirmarAsistencia(defensa.id)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Confirmar Asistencia Ahora
                </Button>
              )
            )}
            
            {/* Estado: FINALIZADA - Puede calificar si confirmó asistencia */}
            {estaFinalizada && (
              miParticipacion?.asistencia_confirmada ? (
                miParticipacion?.ha_calificado ? (
                  <div className="flex items-center text-green-600 text-sm gap-2 mb-2">
                    <CheckCircle className="h-4 w-4" /> Ya has calificado esta defensa
                  </div>
                ) : (
                  <div className="flex items-center text-blue-600 text-sm gap-2 mb-2">
                    <Award className="h-4 w-4" /> Defensa finalizada - Puedes calificar ahora
                  </div>
                )
              ) : (
                <div className="flex items-center text-red-500 text-sm gap-2">
                  <XCircle className="h-4 w-4" /> No confirmaste asistencia durante la defensa
                </div>
              )
            )}
            
            {/* Estado: APROBADA/REPROBADA - Mostrar estado final */}
            {estaAprobadaOReprobada && miParticipacion?.asistencia_confirmada && (
              <div className="flex items-center text-green-600 text-sm gap-2 mb-2">
                <CheckCircle className="h-4 w-4" /> Asistencia Confirmada
              </div>
            )}
            
            {/* Mostrar calificación si ya calificó */}
            {miParticipacion?.ha_calificado && (
              <div className="mt-2 p-2 bg-muted rounded">
                <p className="text-sm font-medium">Tu calificación: {miParticipacion.calificacion}/100</p>
                {miParticipacion.nota_valida === false && (
                  <p className="text-xs text-red-500 mt-1">
                    Nota invalidada: {miParticipacion.motivo_invalidacion}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => { setDefensaSeleccionada(defensa); setModalOpinion(true); }}
          >
            <MessageSquare className="mr-2 h-4 w-4" /> Comentarios
          </Button>
          <Button 
            size="sm" 
            onClick={() => { setDefensaSeleccionada(defensa); setModalEvaluar(true); }}
            disabled={!puedeCalificar}
          >
            <Award className="mr-2 h-4 w-4" /> 
            {miParticipacion?.ha_calificado ? 'Ya calificaste' : 'Calificar'}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <BarraLateral isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden ml-64 transition-all duration-300">
        <header className="bg-card border-b border-border shadow-sm z-10 p-4">
          <h1 className="text-2xl font-bold">Mis Tribunales</h1>
          <p className="text-sm text-muted-foreground">Defensas asignadas como miembro del tribunal</p>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          {cargando ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="pre_defensas">
              <TabsList className="mb-4">
                <TabsTrigger value="pre_defensas">
                  Pre-Defensas ({filtrarPorTipo(TipoDefensa.PRE_DEFENSA).length})
                </TabsTrigger>
                <TabsTrigger value="defensas">
                  Defensas ({filtrarPorTipo(TipoDefensa.DEFENSA).length})
                </TabsTrigger>
                <TabsTrigger value="finalizadas">
                  Finalizadas ({defensasFinalizadas.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pre_defensas">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtrarPorTipo(TipoDefensa.PRE_DEFENSA).map(renderDefensa)}
                  {filtrarPorTipo(TipoDefensa.PRE_DEFENSA).length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center py-8">
                      No tienes pre-defensas asignadas.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="defensas">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtrarPorTipo(TipoDefensa.DEFENSA).map(renderDefensa)}
                  {filtrarPorTipo(TipoDefensa.DEFENSA).length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center py-8">
                      No tienes defensas asignadas.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="finalizadas">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {defensasFinalizadas.map(renderDefensa)}
                  {defensasFinalizadas.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center py-8">
                      No hay defensas finalizadas.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </main>

        {/* Modal Comentarios/Correcciones */}
        <Dialog open={modalOpinion} onOpenChange={setModalOpinion}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Comentarios y Correcciones</DialogTitle>
              <DialogDescription>
                Añade comentarios o correcciones para el proyecto
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Comentarios</Label>
              <Textarea 
                value={opinion} 
                onChange={(e) => setOpinion(e.target.value)} 
                placeholder="Escribe tus observaciones o correcciones sugeridas..." 
                rows={5}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpinion(false)}>Cancelar</Button>
              <Button onClick={enviarOpinion}>Enviar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Calificar */}
        <Dialog open={modalEvaluar} onOpenChange={setModalEvaluar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Calificar {defensaSeleccionada?.tipo === TipoDefensa.PRE_DEFENSA ? 'Pre-Defensa' : 'Defensa'}</DialogTitle>
              <DialogDescription>
                Asigna una nota del 0 al 100. La nota mínima de aprobación es 51.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nota (0-100)</Label>
                <Input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={nota} 
                  onChange={(e) => setNota(e.target.value)} 
                  placeholder="Ej: 75"
                />
              </div>
              
              {/* Observaciones públicas solo para pre-defensa */}
              {defensaSeleccionada?.tipo === TipoDefensa.PRE_DEFENSA && (
                <div>
                  <Label>Observaciones para el Estudiante</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Estas observaciones serán visibles para el estudiante y le ayudarán a mejorar para la defensa final.
                  </p>
                  <Textarea 
                    value={observacionesPublicas} 
                    onChange={(e) => setObservacionesPublicas(e.target.value)} 
                    placeholder="Correcciones, mejoras sugeridas, aspectos a reforzar..." 
                    rows={4}
                  />
                </div>
              )}

              <div>
                <Label>Comentario de Evaluación {defensaSeleccionada?.tipo === TipoDefensa.DEFENSA ? '(interno)' : '(privado)'}</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {defensaSeleccionada?.tipo === TipoDefensa.DEFENSA 
                    ? 'Este comentario no será visible para el estudiante, solo para el administrador.'
                    : 'Este comentario es privado para los evaluadores.'}
                </p>
                <Textarea 
                  value={comentarioEvaluacion} 
                  onChange={(e) => setComentarioEvaluacion(e.target.value)} 
                  placeholder="Justificación de la nota asignada..." 
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalEvaluar(false)}>Cancelar</Button>
              <Button onClick={enviarEvaluacion}>Enviar Evaluación</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MisTribunales;
