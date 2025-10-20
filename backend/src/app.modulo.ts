import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacionModule } from './modulos/autenticacion/autenticacion.modulo';
import { UsuariosModule } from './modulos/usuarios/usuarios.modulo';
import { ProyectosModule } from './modulos/proyectos/proyectos.modulo';
import { DocumentosModule } from './modulos/documentos/documentos.modulo';
import { ObservacionesModule } from './modulos/observaciones/observaciones.modulo';
import { CorreccionesModule } from './modulos/correcciones/correcciones.modulo';
import { EstudiantesModule } from './modulos/estudiantes/estudiantes.modulo';
import { AsesoresModule } from './modulos/asesores/asesores.modulo';
import { PeriodosModule } from './modulos/periodos/periodos.modulo';
import { GruposModule } from './modulos/grupos/grupos.modulo';
import { SolicitudesRegistroModule } from './modulos/solicitudes-registro/solicitudes-registro.modulo';
import { AdministracionModule } from './modulos/administracion/administracion.modulo';
import { SemillaModule } from './modulos/semilla/semilla.modulo';

console.log({
  user: process.env.DB_USER,
  pass: process.env.DB_PASSWORD,
  db: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    SemillaModule,
    AutenticacionModule,
    UsuariosModule,
    ProyectosModule,
    DocumentosModule,
    ObservacionesModule,
    CorreccionesModule,
    EstudiantesModule,
    AsesoresModule,
    PeriodosModule,
    GruposModule,
    SolicitudesRegistroModule,
    AdministracionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}