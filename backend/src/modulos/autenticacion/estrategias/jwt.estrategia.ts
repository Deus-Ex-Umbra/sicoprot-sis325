import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtEstrategia extends PassportStrategy(Strategy) {
  constructor(private readonly config_service: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config_service.get<string>('JWT_SECRET', 'secreto_default'),
    });
  }

  async validate(payload: any) {
    return {
      id_usuario: payload.sub,
      correo: payload.correo,
      rol: payload.rol,
    };
  }
}