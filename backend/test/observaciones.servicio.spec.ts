import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObservacionesService } from './observaciones.servicio';
import { Observacion } from './entidades/observacion.entidad';
import { Documento } from '../documentos/entidades/documento.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CrearObservacionDto } from './dto/crear-observacion.dto';
import { ActualizarObservacionDto } from './dto/actualizar-observacion.dto';
import { EstadoObservacion } from './enums/estado-observacion.enum';

describe('ObservacionesServicio', () => {
  let service: ObservacionesService;
  let observacionRepo: Repository<Observacion>;
  let documentoRepo: Repository<Documento>;
  let asesorRepo: Repository<Asesor>;

  const mockRepo = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(obs => Promise.resolve({ id: Date.now(), ...obs })),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObservacionesService,
        { provide: getRepositoryToken(Observacion), useValue: mockRepo },
        { provide: getRepositoryToken(Documento), useValue: mockRepo },
        { provide: getRepositoryToken(Asesor), useValue: mockRepo },
        { provide: getRepositoryToken(Estudiante), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ObservacionesService>(ObservacionesService);
    observacionRepo = module.get<Repository<Observacion>>(getRepositoryToken(Observacion));
    documentoRepo = module.get<Repository<Documento>>(getRepositoryToken(Documento));
    asesorRepo = module.get<Repository<Asesor>>(getRepositoryToken(Asesor));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('crear', () => {
    it('debería crear una observación', async () => {
        const dto: CrearObservacionDto = { titulo: 'Test', contenido: 'Contenido' } as any;
        jest.spyOn(documentoRepo, 'findOneBy').mockResolvedValue({ id: 1 } as any);
        jest.spyOn(asesorRepo, 'findOne').mockResolvedValue({ id: 1 } as any);
        
        await service.crear(1, dto, 1);
        expect(observacionRepo.save).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el documento no se encuentra', async () => {
        jest.spyOn(documentoRepo, 'findOneBy').mockResolvedValue(null);
        await expect(service.crear(99, {} as any, 1)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si el usuario no es un asesor', async () => {
        jest.spyOn(documentoRepo, 'findOneBy').mockResolvedValue({ id: 1 } as any);
        jest.spyOn(asesorRepo, 'findOne').mockResolvedValue(null);
        await expect(service.crear(1, {} as any, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('actualizar', () => {
    it('debería actualizar el estado de una observación', async () => {
        const dto: ActualizarObservacionDto = { estado: EstadoObservacion.Aprobada };
        const observacion = { id: 1, autor: { id: 1 } };
        const asesor = { id: 1 };
        
        jest.spyOn(observacionRepo, 'findOne').mockResolvedValue(observacion as any);
        jest.spyOn(asesorRepo, 'findOne').mockResolvedValue(asesor as any);

        await service.actualizar(1, dto, 1);
        expect(observacionRepo.save).toHaveBeenCalledWith(expect.objectContaining({ estado: EstadoObservacion.Aprobada }));
    });

    it('debería lanzar NotFoundException si no se encuentra la observación', async () => {
        jest.spyOn(observacionRepo, 'findOne').mockResolvedValue(null);
        await expect(service.actualizar(99, {} as any, 1)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si el usuario no es el autor', async () => {
        const observacion = { id: 1, autor: { id: 2 } };
        const asesor = { id: 1 };
        jest.spyOn(observacionRepo, 'findOne').mockResolvedValue(observacion as any);
        jest.spyOn(asesorRepo, 'findOne').mockResolvedValue(asesor as any);
        await expect(service.actualizar(1, {} as any, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('archivar', () => {
    it('debería archivar una observación', async () => {
        const observacion = { id: 1, archivada: false, autor: { id: 1 } };
        const asesor = { id: 1 };
        
        jest.spyOn(observacionRepo, 'findOne').mockResolvedValue(observacion as any);
        jest.spyOn(asesorRepo, 'findOne').mockResolvedValue(asesor as any);

        await service.archivar(1, 1);
        expect(observacionRepo.save).toHaveBeenCalledWith(expect.objectContaining({ archivada: true }));
    });
  });
});

