import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CorreccionesService } from './correcciones.servicio';
import { Correccion } from './entidades/correccion.entidad';
import { Observacion } from '../observaciones/entidades/observacion.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Documento } from '../documentos/entidades/documento.entidad';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EstadoObservacion } from '../observaciones/enums/estado-observacion.enum';

describe('CorreccionesServicio', () => {
  let service: CorreccionesService;
  let correccionRepo: Repository<Correccion>;
  let observacionRepo: Repository<Observacion>;
  let estudianteRepo: Repository<Estudiante>;
  let documentoRepo: Repository<Documento>;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CorreccionesService,
        { provide: getRepositoryToken(Correccion), useValue: mockRepo },
        { provide: getRepositoryToken(Observacion), useValue: mockRepo },
        { provide: getRepositoryToken(Estudiante), useValue: mockRepo },
        { provide: getRepositoryToken(Documento), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CorreccionesService>(CorreccionesService);
    correccionRepo = module.get<Repository<Correccion>>(getRepositoryToken(Correccion));
    observacionRepo = module.get<Repository<Observacion>>(getRepositoryToken(Observacion));
    estudianteRepo = module.get<Repository<Estudiante>>(getRepositoryToken(Estudiante));
    documentoRepo = module.get<Repository<Documento>>(getRepositoryToken(Documento));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('crear', () => {
    it('debería crear una corrección y actualizar el estado de la observación', async () => {
        const dto = { id_observacion: 1, id_documento: 1, descripcion: 'test' };
        const estudiante = { id: 1 };
        const observacion = { id: 1, correccion: null };
        const documento = { id: 1 };
        
        jest.spyOn(estudianteRepo, 'findOne').mockResolvedValue(estudiante as any);
        jest.spyOn(observacionRepo, 'findOne').mockResolvedValue(observacion as any);
        jest.spyOn(documentoRepo, 'findOneBy').mockResolvedValue(documento as any);
        jest.spyOn(correccionRepo, 'create').mockReturnValue(dto as any);
        jest.spyOn(correccionRepo, 'save').mockResolvedValue(dto as any);
        jest.spyOn(observacionRepo, 'save').mockResolvedValue(undefined);

        const result = await service.crear(dto as any, 1);

        expect(result).toEqual(dto);
        expect(observacionRepo.save).toHaveBeenCalledWith(expect.objectContaining({ estado: EstadoObservacion.Corregida }));
    });

    it('debería lanzar ForbiddenException si el usuario no es un estudiante', async () => {
        jest.spyOn(estudianteRepo, 'findOne').mockResolvedValue(null);
        await expect(service.crear({} as any, 1)).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar NotFoundException si no se encuentra la observación', async () => {
        jest.spyOn(estudianteRepo, 'findOne').mockResolvedValue({ id: 1 } as any);
        jest.spyOn(observacionRepo, 'findOne').mockResolvedValue(null);
        await expect(service.crear({ id_observacion: 99 } as any, 1)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar BadRequestException si la observación ya tiene una corrección', async () => {
        const observacion = { id: 1, correccion: { id: 1 } };
        jest.spyOn(estudianteRepo, 'findOne').mockResolvedValue({ id: 1 } as any);
        jest.spyOn(observacionRepo, 'findOne').mockResolvedValue(observacion as any);
        await expect(service.crear({ id_observacion: 1 } as any, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('eliminar', () => {
    it('debería eliminar una corrección y revertir el estado de la observación', async () => {
        const observacion = { id: 1, estado: EstadoObservacion.Corregida };
        const estudiante = { id: 1 };
        const correccion = { id: 1, estudiante, observacion };

        jest.spyOn(correccionRepo, 'findOne').mockResolvedValue(correccion as any);
        jest.spyOn(estudianteRepo, 'findOne').mockResolvedValue(estudiante as any);
        
        await service.eliminar(1, 1);

        expect(correccionRepo.remove).toHaveBeenCalledWith(correccion);
        expect(observacionRepo.save).toHaveBeenCalledWith(expect.objectContaining({ estado: EstadoObservacion.Pendiente }));
    });
    
    it('debería lanzar NotFoundException si no se encuentra la corrección', async () => {
        jest.spyOn(correccionRepo, 'findOne').mockResolvedValue(null);
        await expect(service.eliminar(99, 1)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si el usuario no es el propietario', async () => {
        const correccion = { id: 1, estudiante: { id: 2 } };
        const estudiante = { id: 1 };
        
        jest.spyOn(correccionRepo, 'findOne').mockResolvedValue(correccion as any);
        jest.spyOn(estudianteRepo, 'findOne').mockResolvedValue(estudiante as any);

        await expect(service.eliminar(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });
});

