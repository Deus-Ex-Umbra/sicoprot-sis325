import { useState, useRef } from 'react';
import { useAutenticacion } from '../contextos/autenticacion-contexto';
import { usuariosApi } from '../servicios/api';
import { toast } from 'sonner';
import { User, Mail, Lock, Save, Loader2, Camera, Upload } from 'lucide-react';
import Cabecera from '../componentes/Cabecera';
import BarraLateral from '../componentes/BarraLateral';
import BarraLateralAdmin from '../componentes/BarraLateralAdmin';
import { cn } from '../lib/utilidades';
import { Rol } from '../tipos/usuario';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../componentes/ui/card';
import { Button } from '../componentes/ui/button';
import { Alert, AlertDescription } from '../componentes/ui/alert';
import { Input } from '../componentes/ui/input';
import { Label } from '../componentes/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../componentes/ui/avatar';
import { Badge } from '../componentes/ui/badge';
import { Separator } from '../componentes/ui/separator';

const Perfil = () => {
  const { usuario, actualizarUsuario } = useAutenticacion();
  const [sidebar_open, set_sidebar_open] = useState(true);
  const [form_data, set_form_data] = useState({
    nombre: usuario?.perfil?.nombre || '',
    apellido: usuario?.perfil?.apellido || '',
    correo: usuario?.correo || '',
    contrasena_actual: '',
    contrasena_nueva: '',
    confirmar_contrasena: '',
  });
  const [error, set_error] = useState('');
  const [guardando, set_guardando] = useState(false);
  const [preview_foto, set_preview_foto] = useState<string | null>(null);
  const input_archivo_ref = useRef<HTMLInputElement>(null);

  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    set_sidebar_open(!sidebar_open);
  };

  const obtener_iniciales = () => {
    if (usuario?.perfil) {
      return `${usuario.perfil.nombre?.[0] || ''}${usuario.perfil.apellido?.[0] || ''}`.toUpperCase();
    }
    return usuario?.correo?.[0]?.toUpperCase() || 'U';
  };

  const manejarCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      if (archivo.size > 5 * 1024 * 1024) {
        toast.error('La imagen debe ser menor a 5MB');
        return;
      }

      if (!archivo.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        set_preview_foto(reader.result as string);
      };
      reader.readAsDataURL(archivo);
    }
  };

  const manejarClickCambiarFoto = () => {
    input_archivo_ref.current?.click();
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    set_error('');

    if (form_data.contrasena_nueva && form_data.contrasena_nueva !== form_data.confirmar_contrasena) {
      set_error('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (form_data.contrasena_nueva && form_data.contrasena_nueva.length < 8) {
      set_error('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    set_guardando(true);

    try {
      const datos_actualizacion: any = {};

      if (form_data.correo !== usuario?.correo) {
        datos_actualizacion.correo = form_data.correo;
      }

      if (form_data.nombre !== usuario?.perfil?.nombre) {
        datos_actualizacion.nombre = form_data.nombre;
      }

      if (form_data.apellido !== usuario?.perfil?.apellido) {
        datos_actualizacion.apellido = form_data.apellido;
      }

      if (form_data.contrasena_nueva) {
        datos_actualizacion.contrasena_actual = form_data.contrasena_actual;
        datos_actualizacion.contrasena_nueva = form_data.contrasena_nueva;
      }

      if (preview_foto) {
        datos_actualizacion.foto_url = preview_foto;
      }

      if (Object.keys(datos_actualizacion).length === 0) {
        set_error('No hay cambios para guardar.');
        set_guardando(false);
        return;
      }

      const usuario_actualizado = await usuariosApi.actualizarPerfil(datos_actualizacion);

      actualizarUsuario(usuario_actualizado);

      toast.success('Perfil actualizado exitosamente');

      set_form_data({
        ...form_data,
        contrasena_actual: '',
        contrasena_nueva: '',
        confirmar_contrasena: '',
      });

      set_preview_foto(null);

    } catch (err: any) {
      set_error(err.response?.data?.message || 'Error al actualizar el perfil');
      toast.error('Error al actualizar el perfil');
    } finally {
      set_guardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Cabecera toggleSidebar={toggleSidebar} />
      {es_admin ? (
        <BarraLateralAdmin isOpen={sidebar_open} />
      ) : (
        <BarraLateral isOpen={sidebar_open} />
      )}

      <main
        className={cn(
          'transition-all duration-300 pt-14',
          sidebar_open ? 'ml-64' : 'ml-0'
        )}
      >
        <div className="container mx-auto p-6 max-w-7xl">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Mi Perfil</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
                <CardDescription>Actualiza tu imagen de perfil</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 ring-4 ring-primary/20">
                    <AvatarImage 
                      src={preview_foto || usuario?.perfil?.foto_url} 
                      alt={`${form_data.nombre} ${form_data.apellido}`} 
                    />
                    <AvatarFallback className="text-4xl font-semibold bg-primary/10">
                      {obtener_iniciales()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    size="icon"
                    variant="default"
                    className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg"
                    onClick={manejarClickCambiarFoto}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    ref={input_archivo_ref}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={manejarCambioArchivo}
                  />
                </div>
                
                <div className="text-center space-y-1">
                  <p className="font-semibold text-lg">
                    {form_data.nombre} {form_data.apellido}
                  </p>
                  <p className="text-sm text-muted-foreground">{usuario?.correo}</p>
                  <Badge variant="outline" className="mt-2">
                    {usuario?.rol}
                  </Badge>
                </div>

                <Separator />

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={manejarClickCambiarFoto}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Cambiar Foto
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  JPG, PNG o GIF. Máximo 5MB.
                </p>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Información de la Cuenta</CardTitle>
                  <CardDescription>Actualiza tu información personal y contraseña</CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={manejarSubmit} className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Información Personal</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre">Nombre</Label>
                          <Input
                            id="nombre"
                            type="text"
                            value={form_data.nombre}
                            onChange={(e) => set_form_data({ ...form_data, nombre: e.target.value })}
                            placeholder="Tu nombre"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="apellido">Apellido</Label>
                          <Input
                            id="apellido"
                            type="text"
                            value={form_data.apellido}
                            onChange={(e) => set_form_data({ ...form_data, apellido: e.target.value })}
                            placeholder="Tu apellido"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Correo Electrónico</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="correo">Correo Electrónico</Label>
                        <Input
                          id="correo"
                          type="email"
                          value={form_data.correo}
                          onChange={(e) => set_form_data({ ...form_data, correo: e.target.value })}
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Cambiar Contraseña</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="contrasena_actual">Contraseña Actual</Label>
                          <Input
                            id="contrasena_actual"
                            type="password"
                            value={form_data.contrasena_actual}
                            onChange={(e) => set_form_data({ ...form_data, contrasena_actual: e.target.value })}
                            placeholder="Ingresa tu contraseña actual"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contrasena_nueva">Nueva Contraseña</Label>
                          <Input
                            id="contrasena_nueva"
                            type="password"
                            value={form_data.contrasena_nueva}
                            onChange={(e) => set_form_data({ ...form_data, contrasena_nueva: e.target.value })}
                            placeholder="Mínimo 8 caracteres"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmar_contrasena">Confirmar Nueva Contraseña</Label>
                          <Input
                            id="confirmar_contrasena"
                            type="password"
                            value={form_data.confirmar_contrasena}
                            onChange={(e) => set_form_data({ ...form_data, confirmar_contrasena: e.target.value })}
                            placeholder="Confirma tu nueva contraseña"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={guardando} className="w-full md:w-auto">
                        {guardando ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Perfil;