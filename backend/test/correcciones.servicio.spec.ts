import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CorreccionesService } from '../src/modulos/correcciones/correcciones.servicio';
import { Correccion } from '../src/modulos/correcciones/entidades/correccion.entidad';
import { Observacion } from '../src/modulos/observaciones/entidades/observacion.entidad';
import { Estudiante } from '../src/modulos/estudiantes/entidades/estudiante.entidad';
import { Documento } from '../src/modulos/documentos/entidades/documento.entidad';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EstadoObservacion } from '../src/modulos/observaciones/enums/estado-observacion.enum';

describe('CorreccionesServicio', () => {
  let service: CorreccionesService;
  let correccionRepo: Repository<Correccion>;
  let observacionRepo: Repository<Observacion>;
  let estudianteRepo: Repository<Estudiante>;
  let documentoRepo: Repository<Documento>;

  const mockCorreccionRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockObservacionRepo = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockEstudianteRepo = {
    findOne: jest.fn(),
  };

  const mockDocumentoRepo = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CorreccionesService,
        { provide: getRepositoryToken(Correccion), useValue: mockCorreccionRepo },
        { provide: getRepositoryToken(Observacion), useValue: mockObservacionRepo },
        { provide: getRepositoryToken(Estudiante), useValue: mockEstudianteRepo },
        { provide: getRepositoryToken(Documento), useValue: mockDocumentoRepo },
      ],
    }).compile();

    service = module.get<CorreccionesService>(CorreccionesService);
    correccionRepo = module.get<Repository<Correccion>>(getRepositoryToken(Correccion));
    observacionRepo = module.get<Repository<Observacion>>(getRepositoryToken(Observacion));
    estudianteRepo = module.get<Repository<Estudiante>>(getRepositoryToken(Estudiante));
    documentoRepo = module.get<Repository<Documento>>(getRepositoryToken(Documento));
    
    jest.clearAllMocks();
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
      const observacionActualizada = { ...observacion, estado: EstadoObservacion.Corregida };

      mockEstudianteRepo.findOne.mockResolvedValue(estudiante);
      mockObservacionRepo.findOne.mockResolvedValue(observacion);
      mockDocumentoRepo.findOneBy.mockResolvedValue(documento);
      mockCorreccionRepo.create.mockReturnValue(dto);
      mockCorreccionRepo.save.mockResolvedValue(dto);
      mockObservacionRepo.save.mockResolvedValue(observacionActualizada);

      const result = await service.crear(dto as any, 1);

      expect(result).toEqual(dto);
      expect(mockObservacionRepo.save).toHaveBeenCalledWith(expect.objectContaining({ estado: EstadoObservacion.Corregida }));
    });

    it('debería lanzar ForbiddenException si el usuario no es un estudiante', async () => {
      mockEstudianteRepo.findOne.mockResolvedValue(null);
      await expect(service.crear({} as any, 1)).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar NotFoundException si no se encuentra la observación', async () => {
      mockEstudianteRepo.findOne.mockResolvedValue({ id: 1 });
      mockObservacionRepo.findOne.mockResolvedValue(null);
      await expect(service.crear({ id_observacion: 99 } as any, 1)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar BadRequestException si la observación ya tiene una corrección', async () => {
      const observacion = { id: 1, correccion: { id: 1 } };
      mockEstudianteRepo.findOne.mockResolvedValue({ id: 1 });
      mockObservacionRepo.findOne.mockResolvedValue(observacion);
      await expect(service.crear({ id_observacion: 1 } as any, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('eliminar', () => {
    it('debería eliminar una corrección y revertir el estado de la observación', async () => {
      const observacion = { id: 1, estado: EstadoObservacion.Corregida };
      const estudiante = { id: 1 };
      const correccion = { id: 1, estudiante, observacion };

      mockCorreccionRepo.findOne.mockResolvedValue(correccion);
      mockEstudianteRepo.findOne.mockResolvedValue(estudiante);
      
      await service.eliminar(1, 1);

      expect(mockCorreccionRepo.remove).toHaveBeenCalledWith(correccion);
      expect(mockObservacionRepo.save).toHaveBeenCalledWith(expect.objectContaining({ estado: EstadoObservacion.Pendiente }));
    });
    
    it('debería lanzar NotFoundException si no se encuentra la corrección', async () => {
      mockCorreccionRepo.findOne.mockResolvedValue(null);
      await expect(service.eliminar(99, 1)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException si el usuario no es el propietario', async () => {
      const correccion = { id: 1, estudiante: { id: 2 } };
      const estudiante = { id: 1 };
      
      mockCorreccionRepo.findOne.mockResolvedValue(correccion);
      mockEstudianteRepo.findOne.mockResolvedValue(estudiante);

      await expect(service.eliminar(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });
});