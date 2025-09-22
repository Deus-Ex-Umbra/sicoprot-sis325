import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObservacionesService } from '../src/modulos/observaciones/observaciones.servicio';
import { Observacion } from '../src/modulos/observaciones/entidades/observacion.entidad';
import { Documento } from '../src/modulos/documentos/entidades/documento.entidad';
import { Asesor } from '../src/modulos/asesores/entidades/asesor.entidad';
import { Estudiante } from '../src/modulos/estudiantes/entidades/estudiante.entidad';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CrearObservacionDto } from '../src/modulos/observaciones/dto/crear-observacion.dto';
import { ActualizarObservacionDto } from '../src/modulos/observaciones/dto/actualizar-observacion.dto';
import { EstadoObservacion } from '../src/modulos/observaciones/enums/estado-observacion.enum';

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
});

