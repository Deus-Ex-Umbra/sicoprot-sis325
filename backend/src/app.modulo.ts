import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacionModule } from './modulos/autenticacion/autenticacion.modulo';
import { UsuariosModule } from './modulos/usuarios/usuarios.modulo';
import { ProyectosModule } from './modulos/proyectos/proyectos.modulo';
import { DocumentosModule } from './modulos/documentos/documentos.modulo';
import { ObservacionesModule } from './modulos/observaciones/observaciones.modulo';

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
    AutenticacionModule,
    UsuariosModule,
    ProyectosModule,
    DocumentosModule,
    ObservacionesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}