import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../componentes/ui/card';
import { Button } from '../componentes/ui/button';
import { Input } from '../componentes/ui/input';
import { Label } from '../componentes/ui/label';
import { Alert, AlertDescription } from '../componentes/ui/alert';

const IniciarSesion = () => {
  const [correo, set_correo] = useState('');
  const [contrasena, set_contrasena] = useState('');
  const [error, set_error] = useState('');
  const [cargando, set_cargando] = useState(false);
  
  const { iniciarSesion } = useAutenticacion();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/panel';

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    set_error('');

    if (!correo || !contrasena) {
      set_error('Todos los campos son obligatorios.');
      return;
    }

    set_cargando(true);

    try {
      await iniciarSesion(correo, contrasena);
      navigate(from, { replace: true });
    } catch (err: any) {
      set_error(err.response?.data?.message || 'Error en el servidor.');
    } finally {
      set_cargando(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder al sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={manejarSubmit} className="space-y-4">
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
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center w-full text-muted-foreground">
          ¿No tienes una cuenta?{' '}
          <Link to="/registrarse" className="text-primary hover:underline font-medium">
            Solicitar acceso
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default IniciarSesion;