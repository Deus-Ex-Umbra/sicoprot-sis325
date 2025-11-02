import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader2, CheckCircle2, GraduationCap, BookOpen, FileText, Users } from 'lucide-react';
import { solicitudesRegistroApi } from '../../servicios/api';
import { Rol } from '../../tipos/usuario';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../componentes/ui/card';
import { Button } from '../../componentes/ui/button';
import { Input } from '../../componentes/ui/input';
import { Label } from '../../componentes/ui/label';
import { Alert, AlertDescription } from '../../componentes/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../componentes/ui/select';

const Registro = () => {
  const navigate = useNavigate();
  
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState<Rol>(Rol.Estudiante);
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre || !apellido || !correo || !contrasena || !confirmarContrasena) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);

    try {
      await solicitudesRegistroApi.crear({ nombre, apellido, correo, contrasena, rol });
      setExito(true);
      setTimeout(() => {
        navigate('/iniciar-sesion');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar la solicitud.');
    } finally {
      setCargando(false);
    }
  };

  const contenidoExito = (
    <Card>
      <CardHeader>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-500" />
        </div>
        <CardTitle className="text-center">¡Solicitud Enviada!</CardTitle>
        <CardDescription className="text-center">
          Tu solicitud ha sido enviada exitosamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertDescription className="text-center">
            Un administrador revisará tu solicitud y te notificaremos cuando tu cuenta sea aprobada.
            Serás redirigido al inicio de sesión...
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="justify-center">
        <Button asChild variant="outline">
          <Link to="/iniciar-sesion">Ir a inicio de sesión</Link>
        </Button>
      </CardFooter>
    </Card>
  );

  const contenidoFormulario = (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Solicitar Acceso</CardTitle>
        <CardDescription>
          Completa el formulario para solicitar una nueva cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={manejarSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre(s)</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Juan"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={cargando}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido(s)</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="apellido"
                  type="text"
                  placeholder="Pérez"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  disabled={cargando}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="correo">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="correo"
                type="email"
                placeholder="tu@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                disabled={cargando}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rol">Rol</Label>
            <Select value={rol} onValueChange={(value) => setRol(value as Rol)} disabled={cargando}>
              <SelectTrigger id="rol">
                <SelectValue placeholder="Selecciona tu rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Rol.Estudiante}>Estudiante</SelectItem>
                <SelectItem value={Rol.Asesor}>Asesor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contrasena">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contrasena"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  disabled={cargando}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmar">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmar"
                  type="password"
                  placeholder="Repetir contraseña"
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  disabled={cargando}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando solicitud...
              </>
            ) : (
              'Solicitar Registro'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center w-full text-muted-foreground">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/iniciar-sesion" className="text-primary hover:underline font-medium">
            Iniciar sesión
          </Link>
        </div>
      </CardFooter>
    </Card>
  );

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
          
          {exito ? contenidoExito : contenidoFormulario}
        </div>
      </div>
    </div>
  );
};

export default Registro;