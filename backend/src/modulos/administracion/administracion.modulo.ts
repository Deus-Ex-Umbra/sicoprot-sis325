import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministracionController } from './administracion.controlador';
import { AdministracionService } from './administracion.servicio';
import { UsuariosModule } from '../usuarios/usuarios.modulo';
import { EstudiantesModule } from '../estudiantes/estudiantes.modulo';
import { AsesoresModule } from '../asesores/asesores.modulo';

@Module({
  imports: [UsuariosModule, EstudiantesModule, AsesoresModule],
  controllers: [AdministracionController],
  providers: [AdministracionService],
})
export class AdministracionModule {}