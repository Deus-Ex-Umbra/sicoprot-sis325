import { Test, TestingModule } from '@nestjs/testing';
import { AutenticacionController } from '../src/modulos/autenticacion/autenticacion.controlador';
import { AutenticacionService } from '../src/modulos/autenticacion/autenticacion.servicio';
import { IniciarSesionDto } from '../src/modulos/autenticacion/dto/iniciar-sesion.dto';
import { RegistroDto } from '../src/modulos/autenticacion/dto/registro.dto';
import { Rol } from '../src/modulos/usuarios/enums/rol.enum';

describe('AutenticacionController', () => {
  let controller: AutenticacionController;
  let service: AutenticacionService;

  const mockAuthService = {
    iniciarSesion: jest.fn(),
    registrarse: jest.fn(),
    cerrarSesion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutenticacionController],
      providers: [
        {
          provide: AutenticacionService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AutenticacionController>(AutenticacionController);
    service = module.get<AutenticacionService>(AutenticacionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('iniciarSesion', () => {
    it('should call authService.iniciarSesion and return its result', async () => {
      const dto: IniciarSesionDto = { correo: 'test@test.com', contrasena: 'password' };
      const expectedResult = { token_acceso: 'some.jwt.token' };
      mockAuthService.iniciarSesion.mockResolvedValue(expectedResult);

      const result = await controller.iniciarSesion(dto);

      expect(result).toEqual(expectedResult);
      expect(service.iniciarSesion).toHaveBeenCalledWith(dto);
    });
  });

  describe('registrarse', () => {
    it('should call authService.registrarse and return its result', async () => {
      const dto: RegistroDto = {
        correo: 'new@test.com',
        contrasena: 'password',
        rol: Rol.Estudiante,
        nombre: 'Nuevo',
        apellido: 'Usuario',
      };
      const expectedResult = { message: 'Registro exitoso' };
      mockAuthService.registrarse.mockResolvedValue(expectedResult);

      const result = await controller.registrarse(dto);

      expect(result).toEqual(expectedResult);
      expect(service.registrarse).toHaveBeenCalledWith(dto);
    });
  });

  describe('cerrarSesion', () => {
    it('should call authService.cerrarSesion and return its result', async () => {
      const expectedResult = { message: 'Sesión cerrada exitosamente.' };
      mockAuthService.cerrarSesion.mockResolvedValue(expectedResult);

      const result = await controller.cerrarSesion();

      expect(result).toEqual(expectedResult);
      expect(service.cerrarSesion).toHaveBeenCalled();
    });
  });
});
