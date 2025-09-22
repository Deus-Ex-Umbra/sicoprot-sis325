import { Test, TestingModule } from '@nestjs/testing';
import { ProyectosController } from '../src/modulos/proyectos/proyectos.controlador';
import { ProyectosService } from '../src/modulos/proyectos/proyectos.servicio';
import { CrearProyectoDto } from '../src/modulos/proyectos/dto/crear-proyecto.dto';
import { JwtGuard } from '../src/modulos/autenticacion/guards/jwt.guard';

describe('ProyectosControlador', () => {
  let controller: ProyectosController;
  let service: ProyectosService;

  const mockProyectosService = {
    crear: jest.fn(),
    obtenerTodos: jest.fn(),
    obtenerUno: jest.fn(),
  };

  const mockRequest = {
    user: {
      id_usuario: 1,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProyectosController],
      providers: [
        {
          provide: ProyectosService,
          useValue: mockProyectosService,
        },
      ],
    })
    .overrideGuard(JwtGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ProyectosController>(ProyectosController);
    service = module.get<ProyectosService>(ProyectosService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('crear', () => {
    it('debería llamar al servicio para crear un proyecto', async () => {
      const dto = new CrearProyectoDto();
      dto.titulo = 'Test';
      dto.id_asesor = 1;
      const expectedResult = { id: 1, ...dto };
      mockProyectosService.crear.mockResolvedValue(expectedResult);

      const result = await controller.crear(dto, mockRequest);
      
      expect(result).toEqual(expectedResult);
      expect(service.crear).toHaveBeenCalledWith(dto, mockRequest.user.id_usuario);
    });
  });

  describe('obtenerTodos', () => {
    it('debería devolver un array de proyectos', async () => {
      const expectedResult = [{ id: 1, titulo: 'Test' }];
      mockProyectosService.obtenerTodos.mockResolvedValue(expectedResult);

      const result = await controller.obtenerTodos();
      
      expect(result).toEqual(expectedResult);
      expect(service.obtenerTodos).toHaveBeenCalled();
    });
  });

  describe('obtenerUno', () => {
    it('debería devolver un único proyecto', async () => {
      const id = 1;
      const expectedResult = { id: 1, titulo: 'Test' };
      mockProyectosService.obtenerUno.mockResolvedValue(expectedResult);
      
      const result = await controller.obtenerUno(id);
      
      expect(result).toEqual(expectedResult);
      expect(service.obtenerUno).toHaveBeenCalledWith(id);
    });
  });
});

