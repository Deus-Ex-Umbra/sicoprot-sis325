import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudRegistro } from './entidades/solicitud-registro.entidad';
import { SolicitudesRegistroController } from './solicitudes-registro.controlador';
import { SolicitudesRegistroService } from './solicitudes-registro.servicio';
import { UsuariosModule } from '../usuarios/usuarios.modulo';
import { EstudiantesModule } from '../estudiantes/estudiantes.modulo';
import { AsesoresModule } from '../asesores/asesores.modulo';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudRegistro]),
    UsuariosModule,
    EstudiantesModule,
    AsesoresModule,
  ],
  controllers: [SolicitudesRegistroController],
  providers: [SolicitudesRegistroService],
  exports: [TypeOrmModule],
})
export class SolicitudesRegistroModule {}