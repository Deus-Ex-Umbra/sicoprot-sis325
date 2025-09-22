import { Test, TestingModule } from '@nestjs/testing';
import { ObservacionesController } from '../src/modulos/observaciones/observaciones.controlador';
import { ObservacionesService } from '../src/modulos/observaciones/observaciones.servicio';
import { CrearObservacionDto } from '../src/modulos/observaciones/dto/crear-observacion.dto';
import { ActualizarObservacionDto } from '../src/modulos/observaciones/dto/actualizar-observacion.dto';
import { JwtGuard } from '../src/modulos/autenticacion/guards/jwt.guard';
import { EstadoObservacion } from '../src/modulos/observaciones/enums/estado-observacion.enum';

describe('ObservacionesControlador', () => {
  let controller: ObservacionesController;
  let service: ObservacionesService;

  const mockObservacionesService = {
    crear: jest.fn(),
    obtenerPorDocumento: jest.fn(),
    obtenerPorEstudiante: jest.fn(),
    actualizar: jest.fn(),
    archivar: jest.fn(),
    restaurar: jest.fn(),
  };

  const mockRequest = {
    user: {
      id_usuario: 1,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObservacionesController],
      providers: [{ provide: ObservacionesService, useValue: mockObservacionesService }],
    })
    .overrideGuard(JwtGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ObservacionesController>(ObservacionesController);
    service = module.get<ObservacionesService>(ObservacionesService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('crear', () => {
    it('debería llamar al servicio para crear una observación', async () => {
      const dto = new CrearObservacionDto();
      const docId = 1;
      await controller.crear(docId, dto, mockRequest);
      expect(service.crear).toHaveBeenCalledWith(docId, dto, mockRequest.user.id_usuario);
    });
  });

  describe('obtenerPorDocumento', () => {
    it('debería obtener las observaciones para un documento', async () => {
      const docId = 1;
      await controller.obtenerPorDocumento(docId, true);
      expect(service.obtenerPorDocumento).toHaveBeenCalledWith(docId, true);
    });
  });

  describe('obtenerPorEstudiante', () => {
    it('debería obtener las observaciones para el estudiante autenticado', async () => {
        await controller.obtenerPorEstudiante(mockRequest);
        expect(service.obtenerPorEstudiante).toHaveBeenCalledWith(mockRequest.user.id_usuario);
    });
  });

  describe('actualizar', () => {
    it('debería actualizar el estado de una observación', async () => {
      const id = 1;
      const dto: ActualizarObservacionDto = { estado: EstadoObservacion.Aprobada };
      await controller.actualizar(id, dto, mockRequest);
      expect(service.actualizar).toHaveBeenCalledWith(id, dto, mockRequest.user.id_usuario);
    });
  });

  describe('archivar', () => {
    it('debería archivar una observación', async () => {
      const id = 1;
      await controller.archivar(id, mockRequest);
      expect(service.archivar).toHaveBeenCalledWith(id, mockRequest.user.id_usuario);
    });
  });

  describe('restaurar', () => {
    it('debería restaurar una observación archivada', async () => {
        const id = 1;
        await controller.restaurar(id, mockRequest);
        expect(service.restaurar).toHaveBeenCalledWith(id, mockRequest.user.id_usuario);
    });
  });
});

