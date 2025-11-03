import { useState } from 'react';
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
import { User, Palette, Lock, Upload, Sun, Moon, Droplet, Waves, Leaf, TreePine, Gem, Sparkles, Flame, FireExtinguisher } from 'lucide-react';
import { cn } from '../lib/utilidades';

export default function Configuracion() {
  const navegar = useNavigate();
  const { usuario } = useAutenticacion();
  const { tema, cambiarTema } = useTema();
  const [sidebar_open, set_sidebar_open] = useState(true);
  const [nombre, set_nombre] = useState(usuario?.perfil?.nombre || '');
  const [apellido, set_apellido] = useState(usuario?.perfil?.apellido || '');
  const [correo, set_correo] = useState(usuario?.correo || '');
  const [contrasena_actual, set_contrasena_actual] = useState('');
  const [contrasena_nueva, set_contrasena_nueva] = useState('');
  const [confirmar_contrasena, set_confirmar_contrasena] = useState('');
  const es_admin = usuario?.rol === Rol.Administrador;
  const toggleSidebar = () => set_sidebar_open(!sidebar_open);
  const obtener_iniciales = () => {
    if (usuario?.perfil) {
      return `${usuario.perfil.nombre?.[0] || ''}${usuario.perfil.apellido?.[0] || ''}`.toUpperCase();
    }
    return usuario?.correo?.[0]?.toUpperCase() || 'U';
  };
  const manejar_guardar_perfil = async () => toast.success('Perfil actualizado correctamente');
  const manejar_cambiar_contrasena = async () => {
    if (contrasena_nueva !== confirmar_contrasena) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    toast.success('Contraseña actualizada correctamente');
  };
  const manejar_cambiar_foto = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (archivo) toast.success('Foto actualizada correctamente');
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
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24">
                        {usuario?.ruta_foto && <AvatarImage src={usuario.ruta_foto} />}
                        {usuario?.perfil?.ruta_foto && <AvatarImage src={usuario.perfil.ruta_foto} />}
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-2xl font-bold">{obtener_iniciales()}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Label htmlFor="foto" className="cursor-pointer">
                          <div className="flex items-center gap-2 text-sm text-primary hover:text-primary/80">
                            <Upload className="h-4 w-4" />Cambiar foto de perfil
                          </div>
                          <Input id="foto" type="file" accept="image/*" className="hidden" onChange={manejar_cambiar_foto} />
                        </Label>
                        <p className="text-xs text-muted-foreground">JPG, PNG o GIF. Máximo 2MB.</p>
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
                    <div className="flex justify-end"><Button onClick={manejar_guardar_perfil}>Guardar Cambios</Button></div>
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
                    <div className="flex justify-end"><Button onClick={manejar_cambiar_contrasena}>Cambiar Contraseña</Button></div>
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
