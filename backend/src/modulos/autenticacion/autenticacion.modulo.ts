import { Module } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.servicio';
import { AutenticacionController } from './autenticacion.controlador';
import { UsuariosModule } from '../usuarios/usuarios.modulo';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtEstrategia } from './estrategias/jwt.estrategia';
import { EstudiantesModule } from '../estudiantes/estudiantes.modulo';
import { AsesoresModule } from '../asesores/asesores.modulo';

@Module({
  imports: [
    UsuariosModule,
    EstudiantesModule,
    AsesoresModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config_service: ConfigService) => ({
        secret: config_service.get<string>('JWT_SECRET', 'secreto_default'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService, JwtEstrategia],
  exports: [AutenticacionService],
})
export class AutenticacionModule {}