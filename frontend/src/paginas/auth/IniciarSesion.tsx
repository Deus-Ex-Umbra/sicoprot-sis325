import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Loader2,
  GraduationCap,
  BookOpen,
  FileText,
  Users,
  AlertCircle,
} from "lucide-react";
import { useAutenticacion } from "../../contextos/autenticacion-contexto";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../componentes/ui/card";
import { Button } from "../../componentes/ui/button";
import { Input } from "../../componentes/ui/input";
import { Label } from "../../componentes/ui/label";

const IniciarSesion = () => {
  const [correo, set_correo] = useState("");
  const [contrasena, set_contrasena] = useState("");
  const [error, set_error] = useState("");
  const [cargando, set_cargando] = useState(false);

  const { iniciarSesion, estaAutenticado } = useAutenticacion();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/panel";

  useEffect(() => {
    if (estaAutenticado()) {
      navigate(from, { replace: true });
    }
  }, [estaAutenticado, navigate, from]);

  const procesarInicioSesion = async () => {
    try {
      await iniciarSesion(correo, contrasena);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Error en inicio de sesión:', err);
      
      if (err.code === 'ERR_NETWORK') {
        set_error('No se pudo conectar con el servidor. Verifica que el backend esté funcionando.');
      } else if (err.response?.status === 401) {
        set_error('Correo o contraseña incorrectos. Verifica tus credenciales.');
      } else if (err.response?.data?.message) {
        set_error(err.response.data.message);
      } else {
        set_error('Error al iniciar sesión. Por favor, intenta de nuevo.');
      }
      
      set_cargando(false);
    }
  };

  const manejarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    set_error('');

    if (!correo || !contrasena) {
      set_error('Todos los campos son obligatorios.');
      return;
    }

    set_cargando(true);
    procesarInicioSesion();
  };

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
              Gestiona eficientemente tus proyectos de titulación con
              seguimiento en tiempo real, colaboración entre asesores y
              estudiantes, y control integral de documentos.
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

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                Iniciar Sesión
              </CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={manejarSubmit} className="space-y-4" noValidate>
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/15 border border-destructive/30 p-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="correo">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="correo"
                      type="email"
                      placeholder="tu@correo.com"
                      value={correo}
                      onChange={(e) => set_correo(e.target.value)}
                      disabled={cargando}
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contrasena">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contrasena"
                      type="password"
                      placeholder="••••••••"
                      value={contrasena}
                      onChange={(e) => set_contrasena(e.target.value)}
                      disabled={cargando}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={cargando}>
                  {cargando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-center w-full text-muted-foreground">
                ¿No tienes una cuenta?{" "}
                <Link
                  to="/registrarse"
                  className="text-primary hover:underline font-medium"
                >
                  Solicitar acceso
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IniciarSesion;