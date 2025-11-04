import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contextos/autenticacion-contexto';
import { useTema } from '../contextos/tema-contexto';
import { Rol } from '../tipos/usuario';
import BarraLateral from '../componentes/barra-lateral';
import BarraLateralAdmin from '../componentes/barra-lateral-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../componentes/ui/card';
import { Label } from '../componentes/ui/label';
import { Input } from '../componentes/ui/input';
import { Button } from '../componentes/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../componentes/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../componentes/ui/tabs';
import { toast } from 'sonner';
import { User, Palette, Lock, Upload, Sun, Moon, Droplet, Waves, Leaf, TreePine, Gem, Sparkles, Flame, FireExtinguisher, Save, Loader2 } from 'lucide-react';
import { cn } from '../lib/utilidades';
import { usuariosApi, obtenerUrlFoto } from '../servicios/api';
import { Alert, AlertDescription } from '../componentes/ui/alert';

export default function Configuracion() {
  const navegar = useNavigate();
  const { usuario, actualizarUsuario } = useAutenticacion();
  const { tema, cambiarTema } = useTema();
  const [sidebar_open, set_sidebar_open] = useState(true);
  const [nombre, set_nombre] = useState(usuario?.perfil?.nombre || '');
  const [apellido, set_apellido] = useState(usuario?.perfil?.apellido || '');
  const [correo, set_correo] = useState(usuario?.correo || '');
  const [preview_foto, set_preview_foto] = useState<string | null>(null);
  const [archivo_foto, set_archivo_foto] = useState<File | null>(null);
  const input_archivo_ref = useRef<HTMLInputElement>(null);
  const [guardando_perfil, set_guardando_perfil] = useState(false);
  const [error_perfil, set_error_perfil] = useState('');
  const [contrasena_actual, set_contrasena_actual] = useState('');
  const [contrasena_nueva, set_contrasena_nueva] = useState('');
  const [confirmar_contrasena, set_confirmar_contrasena] = useState('');
  const [guardando_contrasena, set_guardando_contrasena] = useState(false);
  const [error_contrasena, set_error_contrasena] = useState('');

  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => set_sidebar_open(!sidebar_open);

  const obtener_iniciales = () => {
    if (usuario?.perfil) {
      return `${usuario.perfil.nombre?.[0] || ''}${usuario.perfil.apellido?.[0] || ''}`.toUpperCase();
    }
    return usuario?.correo?.[0]?.toUpperCase() || 'U';
  };

  const manejar_cambio_archivo = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      set_archivo_foto(archivo);
      const reader = new FileReader();
      reader.onloadend = () => {
        set_preview_foto(reader.result as string);
      };
      reader.readAsDataURL(archivo);
    }
  };

  const manejar_click_cambiar_foto = () => {
    input_archivo_ref.current?.click();
  };

  const manejar_guardar_perfil = async () => {
    set_guardando_perfil(true);
    set_error_perfil('');
    let cambios_realizados = false;

    try {
      // 1. Subir la foto si existe
      if (archivo_foto) {
        const form_data_foto = new FormData();
        form_data_foto.append('foto', archivo_foto);
        const usuario_actualizado_foto = await usuariosApi.actualizarFotoPerfil(form_data_foto);
        actualizarUsuario(usuario_actualizado_foto);
        set_preview_foto(null);
        set_archivo_foto(null);
        cambios_realizados = true;
      }

      // 2. Actualizar datos de texto
      const datos_actualizacion_texto: any = {};
      if (nombre !== usuario?.perfil?.nombre) datos_actualizacion_texto.nombre = nombre;
      if (apellido !== usuario?.perfil?.apellido) datos_actualizacion_texto.apellido = apellido;
      if (correo !== usuario?.correo) datos_actualizacion_texto.correo = correo;

      if (Object.keys(datos_actualizacion_texto).length > 0) {
        const usuario_actualizado_texto = await usuariosApi.actualizarPerfil(datos_actualizacion_texto);
        actualizarUsuario(usuario_actualizado_texto);
        cambios_realizados = true;
      }

      if (cambios_realizados) {
        toast.success('Perfil actualizado correctamente');
      } else {
        toast.info('No hay cambios para guardar');
      }

    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al guardar el perfil';
      set_error_perfil(msg);
      toast.error(msg);
    } finally {
      set_guardando_perfil(false);
    }
  };

  const manejar_cambiar_contrasena = async () => {
    set_guardando_contrasena(true);
    set_error_contrasena('');

    if (contrasena_nueva !== confirmar_contrasena) {
      set_error_contrasena('Las contraseñas nuevas no coinciden');
      set_guardando_contrasena(false);
      return;
    }
    if (contrasena_nueva.length < 8) {
      set_error_contrasena('La contraseña debe tener al menos 8 caracteres');
      set_guardando_contrasena(false);
      return;
    }
    if (!contrasena_actual) {
      set_error_contrasena('Debe ingresar su contraseña actual');
      set_guardando_contrasena(false);
      return;
    }

    try {
      const datos_actualizacion = {
        contrasena_actual: contrasena_actual,
        contrasena_nueva: contrasena_nueva,
      };
      const usuario_actualizado = await usuariosApi.actualizarPerfil(datos_actualizacion);
      actualizarUsuario(usuario_actualizado);
      toast.success('Contraseña actualizada correctamente');
      set_contrasena_actual('');
      set_contrasena_nueva('');
      set_confirmar_contrasena('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al cambiar la contraseña';
      set_error_contrasena(msg);
      toast.error(msg);
    } finally {
      set_guardando_contrasena(false);
    }
  };

  const temas_disponibles = [
    { valor: 'light', etiqueta: 'Claro', icono: <Sun className="w-6 h-6" />, descripcion: 'Ideal para entornos bien iluminados.', colores: ['bg-white', 'bg-gray-200', 'bg-gray-400'] },
    { valor: 'dark', etiqueta: 'Oscuro', icono: <Moon className="w-6 h-6" />, descripcion: 'Descansa la vista en ambientes oscuros.', colores: ['bg-gray-900', 'bg-gray-700', 'bg-gray-500'] },
    { valor: 'light-blue', etiqueta: 'Azul Claro', icono: <Droplet className="w-6 h-6" />, descripcion: 'Suave y limpio con tonos celestes.', colores: ['bg-blue-100', 'bg-blue-300', 'bg-blue-500'] },
    { valor: 'dark-blue', etiqueta: 'Azul Oscuro', icono: <Waves className="w-6 h-6" />, descripcion: 'Elegante con acentos marinos.', colores: ['bg-blue-900', 'bg-blue-700', 'bg-blue-500'] },
    { valor: 'light-green', etiqueta: 'Verde Claro', icono: <Leaf className="w-6 h-6" />, descripcion: 'Fresco y natural, tonos suaves.', colores: ['bg-green-100', 'bg-green-300', 'bg-green-500'] },
    { valor: 'dark-green', etiqueta: 'Verde Oscuro', icono: <TreePine className="w-6 h-6" />, descripcion: 'Inspirado en la naturaleza profunda.', colores: ['bg-green-900', 'bg-green-700', 'bg-green-500'] },
    { valor: 'light-purple', etiqueta: 'Púrpura Claro', icono: <Gem className="w-6 h-6" />, descripcion: 'Brillante con matices violetas.', colores: ['bg-purple-100', 'bg-purple-300', 'bg-purple-500'] },
    { valor: 'dark-purple', etiqueta: 'Púrpura Oscuro', icono: <Sparkles className="w-6 h-6" />, descripcion: 'Misterioso y moderno.', colores: ['bg-purple-900', 'bg-purple-700', 'bg-purple-500'] },
    { valor: 'light-red', etiqueta: 'Rojo Claro', icono: <Flame className="w-6 h-6" />, descripcion: 'Energía cálida con tonos suaves.', colores: ['bg-red-100', 'bg-red-300', 'bg-red-500'] },
    { valor: 'dark-red', etiqueta: 'Rojo Oscuro', icono: <FireExtinguisher className="w-6 h-6" />, descripcion: 'Fuerte y apasionado.', colores: ['bg-red-900', 'bg-red-700', 'bg-red-500'] },
  ];

  const ruta_foto_actual = obtenerUrlFoto(usuario?.ruta_foto || usuario?.perfil?.ruta_foto);

  return (
    <div className="min-h-screen bg-background">
      {es_admin ? <BarraLateralAdmin isOpen={sidebar_open} /> : <BarraLateral isOpen={sidebar_open} />}
      <main className={cn('transition-all duration-300', sidebar_open ? 'ml-64' : 'ml-0')}>
        <div className="container mx-auto p-8 max-w-6xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
              <p className="text-muted-foreground">Administra tu perfil y preferencias de la aplicación</p>
            </div>
            <Tabs defaultValue="perfil" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="perfil"><User className="h-4 w-4 mr-2" />Perfil</TabsTrigger>
                <TabsTrigger value="apariencia"><Palette className="h-4 w-4 mr-2" />Apariencia</TabsTrigger>
                <TabsTrigger value="seguridad"><Lock className="h-4 w-4 mr-2" />Seguridad</TabsTrigger>
              </TabsList>
              <TabsContent value="perfil" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Actualiza tu información de perfil</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {error_perfil && (
                      <Alert variant="destructive">
                        <AlertDescription>{error_perfil}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={preview_foto || ruta_foto_actual} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-2xl font-bold">{obtener_iniciales()}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Label htmlFor="foto" className="cursor-pointer">
                          <div className="flex items-center gap-2 text-sm text-primary hover:text-primary/80">
                            <Upload className="h-4 w-4" />Cambiar foto de perfil
                          </div>
                          <Input ref={input_archivo_ref} id="foto" type="file" accept="image/*" className="hidden" onChange={manejar_cambio_archivo} />
                        </Label>
                        <p className="text-xs text-muted-foreground">JPG, PNG o GIF. Máximo 5MB.</p>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input id="nombre" value={nombre} onChange={(e) => set_nombre(e.target.value)} placeholder="Tu nombre" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellido">Apellido</Label>
                        <Input id="apellido" value={apellido} onChange={(e) => set_apellido(e.target.value)} placeholder="Tu apellido" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="correo">Correo Electrónico</Label>
                      <Input id="correo" type="email" value={correo} onChange={(e) => set_correo(e.target.value)} placeholder="tu@correo.com" />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={manejar_guardar_perfil} disabled={guardando_perfil}>
                        {guardando_perfil ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Guardar Cambios
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="apariencia" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tema de la Aplicación</CardTitle>
                    <CardDescription>Personaliza la apariencia de la aplicación</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Tema Actual: {temas_disponibles.find(t => t.valor === tema)?.etiqueta}</Label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {temas_disponibles.map((tema_opcion) => (
                        <button
                          key={tema_opcion.valor}
                          onClick={() => cambiarTema(tema_opcion.valor as any)}
                          className={`p-4 rounded-xl border-2 flex flex-col items-center justify-between transition-all hover:scale-105 gap-2 h-40 ${
                            tema === tema_opcion.valor ? 'border-primary shadow-lg bg-muted/40' : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="text-primary">{tema_opcion.icono}</div>
                            <p className="text-sm font-medium text-center">{tema_opcion.etiqueta}</p>
                          </div>
                          <div className="flex gap-1 mt-2">
                            {tema_opcion.colores.map((c, i) => (
                              <div key={i} className={`w-5 h-5 rounded-md ${c}`} />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground text-center mt-2">{tema_opcion.descripcion}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="seguridad" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cambiar Contraseña</CardTitle>
                    <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error_contrasena && (
                      <Alert variant="destructive">
                        <AlertDescription>{error_contrasena}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="contrasena_actual">Contraseña Actual</Label>
                      <Input id="contrasena_actual" type="password" value={contrasena_actual} onChange={(e) => set_contrasena_actual(e.target.value)} placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contrasena_nueva">Nueva Contraseña</Label>
                      <Input id="contrasena_nueva" type="password" value={contrasena_nueva} onChange={(e) => set_contrasena_nueva(e.target.value)} placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmar_contrasena">Confirmar Nueva Contraseña</Label>
                      <Input id="confirmar_contrasena" type="password" value={confirmar_contrasena} onChange={(e) => set_confirmar_contrasena(e.target.value)} placeholder="••••••••" />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={manejar_cambiar_contrasena} disabled={guardando_contrasena}>
                        {guardando_contrasena ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Cambiar Contraseña
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}