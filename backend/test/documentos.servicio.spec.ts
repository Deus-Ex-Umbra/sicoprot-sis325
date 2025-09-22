import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentosService } from '../src/modulos/documentos/documentos.servicio';
import { Documento } from '../src/modulos/documentos/entidades/documento.entidad';
import { Proyecto } from '../src/modulos/proyectos/entidades/proyecto.endidad';
import { NotFoundException } from '@nestjs/common';

describe('DocumentosServicio', () => {
  let service: DocumentosService;
  let docRepo: Repository<Documento>;
  let projRepo: Repository<Proyecto>;

  const mockDocRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockProjRepo = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentosService,
        { provide: getRepositoryToken(Documento), useValue: mockDocRepo },
        { provide: getRepositoryToken(Proyecto), useValue: mockProjRepo },
      ],
    }).compile();

    service = module.get<DocumentosService>(DocumentosService);
    docRepo = module.get<Repository<Documento>>(getRepositoryToken(Documento));
    projRepo = module.get<Repository<Proyecto>>(getRepositoryToken(Proyecto));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('guardarRegistro', () => {
    it('debería guardar un registro de documento exitosamente', async () => {
      const proyectoId = 1;
      const file = { originalname: 'test.pdf', path: 'uploads/test.pdf' } as Express.Multer.File;
      const proyecto = { id: 1 };
      const newDoc = { nombre_archivo: file.originalname, ruta_archivo: file.path, proyecto };

      mockProjRepo.findOneBy.mockResolvedValue(proyecto);
      mockDocRepo.create.mockReturnValue(newDoc);
      mockDocRepo.save.mockResolvedValue({ id: 1, ...newDoc });

      const result = await service.guardarRegistro(proyectoId, file);

      expect(result).toHaveProperty('id');
      expect(mockProjRepo.findOneBy).toHaveBeenCalledWith({ id: proyectoId });
      expect(mockDocRepo.create).toHaveBeenCalledWith(expect.objectContaining({ proyecto }));
      expect(mockDocRepo.save).toHaveBeenCalledWith(newDoc);
    });

    it('debería lanzar NotFoundException si el proyecto no existe', async () => {
      const proyectoId = 99;
      const file = {} as Express.Multer.File;
      mockProjRepo.findOneBy.mockResolvedValue(null);

      await expect(service.guardarRegistro(proyectoId, file)).rejects.toThrow(NotFoundException);
    });

    it('debería llamar a las funciones del repositorio con los parámetros correctos', async () => {
        const proyectoId = 2;
        const file = { originalname: 'file.pdf', path: 'path/file.pdf' } as Express.Multer.File;
        const proyecto = { id: 2 };

        mockProjRepo.findOneBy.mockResolvedValue(proyecto);
        mockDocRepo.create.mockImplementation(doc => doc);
        mockDocRepo.save.mockImplementation(doc => ({ id: 1, ...doc }));
        
        await service.guardarRegistro(proyectoId, file);
        
        expect(mockProjRepo.findOneBy).toHaveBeenCalledWith({ id: 2 });
        expect(mockDocRepo.create).toHaveBeenCalledWith({
            nombre_archivo: 'file.pdf',
            ruta_archivo: 'path/file.pdf',
            proyecto,
        });
    });
  });

  describe('obtenerUno', () => {
    it('debería devolver un documento si se encuentra', async () => {
      const docId = 1;
      const doc = { id: 1, nombre_archivo: 'test.pdf' };
      mockDocRepo.findOneBy.mockResolvedValue(doc);

      const result = await service.obtenerUno(docId);

      expect(result).toEqual(doc);
      expect(mockDocRepo.findOneBy).toHaveBeenCalledWith({ id: docId });
    });

    it('debería lanzar NotFoundException si el documento no se encuentra', async () => {
      const docId = 99;
      mockDocRepo.findOneBy.mockResolvedValue(null);

      await expect(service.obtenerUno(docId)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar el mensaje de error correcto para un documento no encontrado', async () => {
      const docId = 99;
      mockDocRepo.findOneBy.mockResolvedValue(null);
      await expect(service.obtenerUno(docId)).rejects.toThrow(`Documento con ID '${docId}' no encontrado.`);
    });
  });
});

