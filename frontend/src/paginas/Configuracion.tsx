import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuLateral } from '../componentes/menu-lateral';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../componentes/ui/card';
import { Label } from '../componentes/ui/label';
import { Input } from '../componentes/ui/input';
import { Button } from '../componentes/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../componentes/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../componentes/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../componentes/ui/tabs';
import { useAutenticacion } from '../contextos/autenticacion-contexto';
import { useTema } from '../contextos/tema-contexto';
import { toast } from 'sonner';
import { User, Palette, Lock, Upload } from 'lucide-react';

export default function Configuracion() {
  const navegar = useNavigate();
  const { usuario } = useAutenticacion();
  const { tema, cambiarTema } = useTema();
  
  const [nombre, set_nombre] = useState(usuario?.perfil?.nombre || '');
  const [apellido, set_apellido] = useState(usuario?.perfil?.apellido || '');
  const [correo, set_correo] = useState(usuario?.correo || '');
  const [contrasena_actual, set_contrasena_actual] = useState('');
  const [contrasena_nueva, set_contrasena_nueva] = useState('');
  const [confirmar_contrasena, set_confirmar_contrasena] = useState('');

  const obtener_iniciales = () => {
    if (usuario?.perfil) {
      return `${usuario.perfil.nombre?.[0] || ''}${usuario.perfil.apellido?.[0] || ''}`.toUpperCase();
    }
    return usuario?.correo?.[0]?.toUpperCase() || 'U';
  };

  const manejar_guardar_perfil = async () => {
    toast.success('Perfil actualizado correctamente');
  };

  const manejar_cambiar_contrasena = async () => {
    if (contrasena_nueva !== confirmar_contrasena) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    toast.success('Contraseña actualizada correctamente');
  };

  const manejar_cambiar_foto = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (archivo) {
      toast.success('Foto actualizada correctamente');
    }
  };

  const temas_disponibles = [
    { valor: 'light', etiqueta: 'Claro', descripcion: 'Tema claro predeterminado' },
    { valor: 'dark', etiqueta: 'Oscuro', descripcion: 'Tema oscuro predeterminado' },
    { valor: 'light-blue', etiqueta: 'Azul Claro', descripcion: 'Tonos azules claros' },
    { valor: 'dark-blue', etiqueta: 'Azul Oscuro', descripcion: 'Tonos azules oscuros' },
    { valor: 'light-green', etiqueta: 'Verde Claro', descripcion: 'Tonos verdes claros' },
    { valor: 'dark-green', etiqueta: 'Verde Oscuro', descripcion: 'Tonos verdes oscuros' },
    { valor: 'light-purple', etiqueta: 'Púrpura Claro', descripcion: 'Tonos púrpuras claros' },
    { valor: 'dark-purple', etiqueta: 'Púrpura Oscuro', descripcion: 'Tonos púrpuras oscuros' },
    { valor: 'light-red', etiqueta: 'Rojo Claro', descripcion: 'Tonos rojos claros' },
    { valor: 'dark-red', etiqueta: 'Rojo Oscuro', descripcion: 'Tonos rojos oscuros' },
  ];

  return (
    <div className="flex h-screen bg-background">
      <MenuLateral />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8 max-w-6xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
              <p className="text-muted-foreground">
                Administra tu perfil y preferencias de la aplicación
              </p>
            </div>

            <Tabs defaultValue="perfil" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="perfil">
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="apariencia">
                  <Palette className="h-4 w-4 mr-2" />
                  Apariencia
                </TabsTrigger>
                <TabsTrigger value="seguridad">
                  <Lock className="h-4 w-4 mr-2" />
                  Seguridad
                </TabsTrigger>
              </TabsList>

              <TabsContent value="perfil" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>
                      Actualiza tu información de perfil
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24">
                        {usuario?.ruta_foto && <AvatarImage src={usuario.ruta_foto} />}
                        {usuario?.perfil?.ruta_foto && <AvatarImage src={usuario.perfil.ruta_foto} />}
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-2xl font-bold">
                          {obtener_iniciales()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Label htmlFor="foto" className="cursor-pointer">
                          <div className="flex items-center gap-2 text-sm text-primary hover:text-primary/80">
                            <Upload className="h-4 w-4" />
                            Cambiar foto de perfil
                          </div>
                          <Input
                            id="foto"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={manejar_cambiar_foto}
                          />
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG o GIF. Máximo 2MB.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                          id="nombre"
                          value={nombre}
                          onChange={(e) => set_nombre(e.target.value)}
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellido">Apellido</Label>
                        <Input
                          id="apellido"
                          value={apellido}
                          onChange={(e) => set_apellido(e.target.value)}
                          placeholder="Tu apellido"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="correo">Correo Electrónico</Label>
                      <Input
                        id="correo"
                        type="email"
                        value={correo}
                        onChange={(e) => set_correo(e.target.value)}
                        placeholder="tu@correo.com"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={manejar_guardar_perfil}>
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
                    <CardDescription>
                      Personaliza la apariencia de la aplicación
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Tema Actual: {temas_disponibles.find(t => t.valor === tema)?.etiqueta}</Label>
                      <Select value={tema} onValueChange={(valor) => cambiarTema(valor as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tema" />
                        </SelectTrigger>
                        <SelectContent>
                          {temas_disponibles.map((tema_opcion) => (
                            <SelectItem key={tema_opcion.valor} value={tema_opcion.valor}>
                              <div className="flex flex-col">
                                <span className="font-medium">{tema_opcion.etiqueta}</span>
                                <span className="text-xs text-muted-foreground">
                                  {tema_opcion.descripcion}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {temas_disponibles.map((tema_opcion) => (
                        <button
                          key={tema_opcion.valor}
                          onClick={() => cambiarTema(tema_opcion.valor as any)}
                          className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                            tema === tema_opcion.valor
                              ? 'border-primary shadow-lg'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="aspect-video rounded bg-gradient-to-br from-primary to-primary/30 mb-2" />
                          <p className="text-xs font-medium text-center">{tema_opcion.etiqueta}</p>
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
                    <CardDescription>
                      Actualiza tu contraseña para mantener tu cuenta segura
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contrasena_actual">Contraseña Actual</Label>
                      <Input
                        id="contrasena_actual"
                        type="password"
                        value={contrasena_actual}
                        onChange={(e) => set_contrasena_actual(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contrasena_nueva">Nueva Contraseña</Label>
                      <Input
                        id="contrasena_nueva"
                        type="password"
                        value={contrasena_nueva}
                        onChange={(e) => set_contrasena_nueva(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmar_contrasena">Confirmar Nueva Contraseña</Label>
                      <Input
                        id="confirmar_contrasena"
                        type="password"
                        value={confirmar_contrasena}
                        onChange={(e) => set_confirmar_contrasena(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={manejar_cambiar_contrasena}>
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