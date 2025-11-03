import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministracionController } from './administracion.controlador';
import { AdministracionService } from './administracion.servicio';
import { UsuariosModule } from '../usuarios/usuarios.modulo';
import { EstudiantesModule } from '../estudiantes/estudiantes.modulo';
import { AsesoresModule } from '../asesores/asesores.modulo';
import { Grupo } from '../grupos/entidades/grupo.entidad';
import { Periodo } from '../periodos/entidades/periodo.entidad';
import { SolicitudRegistro } from '../solicitudes-registro/entidades/solicitud-registro.entidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grupo, Periodo, SolicitudRegistro]),
    UsuariosModule,
    EstudiantesModule,
    AsesoresModule,
  ],
  controllers: [AdministracionController],
  providers: [AdministracionService],
  exports: [AdministracionService],
})
export class AdministracionModule {}