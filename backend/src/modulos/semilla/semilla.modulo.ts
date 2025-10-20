import { Module } from '@nestjs/common';
import { SemillaService } from './semilla.servicio';
import { UsuariosModule } from '../usuarios/usuarios.modulo';

@Module({
  imports: [UsuariosModule],
  providers: [SemillaService],
})
export class SemillaModule {}