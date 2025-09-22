import { Test, TestingModule } from '@nestjs/testing';
import { CorreccionesController } from '../src/modulos/correcciones/correcciones.controlador';
import { CorreccionesService } from '../src/modulos/correcciones/correcciones.servicio';
import { CrearCorreccionDto } from '../src/modulos/correcciones/dto/crear-correccion.dto';
import { JwtGuard } from '../src/modulos/autenticacion/guards/jwt.guard';

describe('CorreccionesControlador', () => {
  let controller: CorreccionesController;
  let service: CorreccionesService;

  const mockCorreccionesService = {
    crear: jest.fn(),
    obtenerPorDocumento: jest.fn(),
    obtenerPorObservacion: jest.fn(),
    eliminar: jest.fn(),
  };

  const mockRequest = {
    user: {
      id_usuario: 1,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorreccionesController],
      providers: [
        {
          provide: CorreccionesService,
          useValue: mockCorreccionesService,
        },
      ],
    })
    .overrideGuard(JwtGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<CorreccionesController>(CorreccionesController);
    service = module.get<CorreccionesService>(CorreccionesService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('crear', () => {
    it('debería crear una corrección', async () => {
      const dto = new CrearCorreccionDto();
      const expectedResult = { id: 1, ...dto };
      mockCorreccionesService.crear.mockResolvedValue(expectedResult);

      const result = await controller.crear(dto, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(service.crear).toHaveBeenCalledWith(dto, mockRequest.user.id_usuario);
    });
  });

  describe('obtenerPorDocumento', () => {
    it('debería devolver las correcciones para un documento', async () => {
      const documentoId = 1;
      const expectedResult = [{ id: 1, descripcion: 'Corrección' }];
      mockCorreccionesService.obtenerPorDocumento.mockResolvedValue(expectedResult);

      const result = await controller.obtenerPorDocumento(documentoId);

      expect(result).toEqual(expectedResult);
      expect(service.obtenerPorDocumento).toHaveBeenCalledWith(documentoId);
    });
  });

  describe('obtenerPorObservacion', () => {
    it('debería devolver una corrección para una observación', async () => {
      const observacionId = 1;
      const expectedResult = { id: 1, descripcion: 'Corrección' };
      mockCorreccionesService.obtenerPorObservacion.mockResolvedValue(expectedResult);

      const result = await controller.obtenerPorObservacion(observacionId);

      expect(result).toEqual(expectedResult);
      expect(service.obtenerPorObservacion).toHaveBeenCalledWith(observacionId);
    });
  });

  describe('eliminar', () => {
    it('debería eliminar una corrección', async () => {
      const id = 1;
      const expectedResult = { message: 'Corrección eliminada exitosamente.' };
      mockCorreccionesService.eliminar.mockResolvedValue(expectedResult);

      const result = await controller.eliminar(id, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(service.eliminar).toHaveBeenCalledWith(id, mockRequest.user.id_usuario);
    });
  });
});

