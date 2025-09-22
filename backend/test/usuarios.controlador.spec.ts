import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from '../src/modulos/usuarios/usuarios.controlador';
import { UsuariosService } from '../src/modulos/usuarios/usuarios.servicio';
import { CrearUsuarioDto } from '../src/modulos/usuarios/dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from '../src/modulos/usuarios/dto/actualizar-usuario.dto';
import { Rol } from '../src/modulos/usuarios/enums/rol.enum';

describe('UsuariosControlador', () => {
  let controller: UsuariosController;
  let service: UsuariosService;

  const mockUsuariosService = {
    crear: jest.fn(),
    obtenerTodos: jest.fn(),
    obtenerUno: jest.fn(),
    actualizar: jest.fn(),
    eliminar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          provide: UsuariosService,
          useValue: mockUsuariosService,
        },
      ],
    }).compile();

    controller = module.get<UsuariosController>(UsuariosController);
    service = module.get<UsuariosService>(UsuariosService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('crear', () => {
    it('debería llamar a service.crear con el dto', async () => {
      const dto = new CrearUsuarioDto();
      dto.correo = 'test@test.com';
      dto.contrasena = 'password123';
      dto.rol = Rol.Estudiante;
      dto.nombre = 'Test';
      dto.apellido = 'User';
      
      await controller.crear(dto);
      expect(service.crear).toHaveBeenCalledWith(dto);
    });
  });

  describe('obtenerTodos', () => {
    it('debería llamar a service.obtenerTodos', async () => {
      await controller.obtenerTodos();
      expect(service.obtenerTodos).toHaveBeenCalled();
    });
  });

  describe('obtenerUno', () => {
    it('debería llamar a service.obtenerUno con el id', async () => {
      const id = 1;
      await controller.obtenerUno(id);
      expect(service.obtenerUno).toHaveBeenCalledWith(id);
    });
  });

  describe('actualizar', () => {
    it('debería llamar a service.actualizar con el id y el dto', async () => {
      const id = 1;
      const dto = new ActualizarUsuarioDto();
      await controller.actualizar(id, dto);
      expect(service.actualizar).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('eliminar', () => {
    it('debería llamar a service.eliminar con el id', async () => {
      const id = 1;
      await controller.eliminar(id);
      expect(service.eliminar).toHaveBeenCalledWith(id);
    });
  });
});

