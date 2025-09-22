import { Test, TestingModule } from '@nestjs/testing';
import { AsesoresController } from './asesores.controlador';
import { AsesoresService } from './asesores.servicio';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';

describe('AsesoresControlador', () => {
  let controller: AsesoresController;
  let service: AsesoresService;

  const mockAsesoresService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsesoresController],
      providers: [
        {
          provide: AsesoresService,
          useValue: mockAsesoresService,
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AsesoresController>(AsesoresController);
    service = module.get<AsesoresService>(AsesoresService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debería devolver un array de asesores', async () => {
      const result = [{ id: 1, nombre: 'Asesor', apellido: 'Prueba', usuario: { id: 1, correo: 'asesor@test.com' } }];
      mockAsesoresService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('debería devolver un array vacío si no se encuentran asesores', async () => {
      const result = [];
      mockAsesoresService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('debería llamar al método del servicio una vez', async () => {
        await controller.findAll();
        expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });
});

