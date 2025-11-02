import { Outlet } from 'react-router-dom';
import { GraduationCap, BookOpen, FileText, Users } from 'lucide-react';

const LayoutAutenticacion = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">SICOPROT</h1>
                <p className="text-sm text-muted-foreground">
                  Sistema de Control de Proyectos de Titulación
                </p>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Gestiona eficientemente tus proyectos de titulación con seguimiento en tiempo real,
              colaboración entre asesores y estudiantes, y control integral de documentos.
            </p>
          </div>

          <div className="space-y-4 mt-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Gestión de Documentos</h3>
                <p className="text-sm text-muted-foreground">
                  Sube, versiona y revisa documentos del proyecto
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Colaboración</h3>
                <p className="text-sm text-muted-foreground">
                  Comunicación directa entre estudiantes y asesores
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Seguimiento</h3>
                <p className="text-sm text-muted-foreground">
                  Observaciones y correcciones en tiempo real
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="md:hidden mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight mb-2">SICOPROT</h1>
            <p className="text-sm text-muted-foreground">
              Sistema de Control de Proyectos de Titulación
            </p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default LayoutAutenticacion;