import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, GraduationCap, BookOpen, LogIn, FileText, Tag } from 'lucide-react';
import { repositorioPublicoApi } from '../servicios/api';
import { Card, CardContent, CardHeader, CardTitle } from '../componentes/ui/card';
import { Button } from '../componentes/ui/button';
import { Badge } from '../componentes/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../componentes/ui/alert';
import { SwitchModo } from '../componentes/switch-modo';

interface Proyecto {
  id: number;
  titulo: string;
  resumen?: string;
  palabras_clave?: string[];
  fecha_creacion: Date;
  etapa_actual: string;
  proyecto_aprobado: boolean;
  perfil_aprobado: boolean;
  estudiantes: Array<{
    id: number;
    nombre: string;
    apellido: string;
  }>;
  asesor?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  documentos?: Array<{
    id: number;
    nombre_archivo: string;
    tipo_documento: string;
    fecha_subida: Date;
  }>;
}

const DetalleProyectoPublico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [proyecto, set_proyecto] = useState<Proyecto | null>(null);
  const [cargando, set_cargando] = useState(true);
  const [error, set_error] = useState('');

  useEffect(() => {
    cargar_proyecto();
  }, [id]);

  const cargar_proyecto = async () => {
    try {
      set_cargando(true);
      set_error('');
      const data = await repositorioPublicoApi.obtenerProyecto(Number(id));
      set_proyecto(data);
    } catch (err: any) {
      set_error(err.response?.data?.message || 'Error al cargar el proyecto');
    } finally {
      set_cargando(false);
    }
  };

  const obtenerNombreAutores = () => {
    if (!proyecto?.estudiantes || proyecto.estudiantes.length === 0) return 'N/A';
    return proyecto.estudiantes
      .map(e => `${e.nombre || ''} ${e.apellido || ''}`.trim())
      .filter(n => n)
      .join(', ') || 'N/A';
  };

  const obtenerNombreAsesor = () => {
    if (!proyecto?.asesor) return 'N/A';
    return `${proyecto.asesor.nombre} ${proyecto.asesor.apellido}`;
  };

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

      <main className="container mx-auto p-6 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/repositorio')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Repositorio
        </Button>

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
        ) : proyecto ? (
          <div className="space-y-6">
            {/* Información Principal */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <GraduationCap className="h-6 w-6 text-green-600" />
                      <CardTitle className="text-2xl">{proyecto.titulo}</CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {proyecto.proyecto_aprobado && (
                        <Badge variant="default" className="bg-green-500">
                          Proyecto Aprobado
                        </Badge>
                      )}
                      {proyecto.perfil_aprobado && (
                        <Badge variant="default" className="bg-blue-500">
                          Perfil Aprobado
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {proyecto.etapa_actual.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Autores y Asesor */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Autor(es)</p>
                      <p className="text-muted-foreground">{obtenerNombreAutores()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Asesor</p>
                      <p className="text-muted-foreground">{obtenerNombreAsesor()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Fecha de Creación</p>
                      <p className="text-muted-foreground">
                        {new Date(proyecto.fecha_creacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resumen */}
                {proyecto.resumen && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-medium">Resumen</h3>
                    </div>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {proyecto.resumen}
                    </p>
                  </div>
                )}

                {/* Palabras Clave */}
                {proyecto.palabras_clave && proyecto.palabras_clave.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-medium">Palabras Clave</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {proyecto.palabras_clave.map((palabra, index) => (
                        <Badge key={index} variant="secondary">
                          {palabra}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documentos Públicos */}
            {proyecto.documentos && proyecto.documentos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {proyecto.documentos.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.nombre_archivo}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.tipo_documento} • {new Date(doc.fecha_subida).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Alert className="mt-4">
                    <AlertDescription>
                      Para descargar los documentos completos, por favor inicia sesión en el sistema.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Proyecto no encontrado</p>
              <p className="text-sm text-muted-foreground">
                El proyecto que buscas no existe o no está disponible públicamente.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default DetalleProyectoPublico;
