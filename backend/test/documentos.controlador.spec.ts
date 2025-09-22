import { Test, TestingModule } from '@nestjs/testing';
import { DocumentosController } from './documentos.controlador';
import { DocumentosService } from './documentos.servicio';
import { Response } from 'express';
import { createReadStream, ReadStream } from 'fs';
import { join } from 'path';

jest.mock('fs', () => ({
  createReadStream: jest.fn().mockReturnValue({
    pipe: jest.fn(),
  }),
}));

describe('DocumentosControlador', () => {
  let controller: DocumentosController;
  let service: DocumentosService;

  const mockDocumentosService = {
    guardarRegistro: jest.fn(),
    obtenerUno: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentosController],
      providers: [
        {
          provide: DocumentosService,
          useValue: mockDocumentosService,
        },
      ],
    }).compile();

    controller = module.get<DocumentosController>(DocumentosController);
    service = module.get<DocumentosService>(DocumentosService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('subirDocumento', () => {
    it('debería llamar al servicio para guardar el registro del documento', async () => {
      const proyectoId = 1;
      const file = { originalname: 'test.pdf' } as Express.Multer.File;
      const expectedResult = { id: 1, nombre_archivo: 'test.pdf' };
      mockDocumentosService.guardarRegistro.mockResolvedValue(expectedResult);

      const result = await controller.subirDocumento(proyectoId, file);

      expect(result).toEqual(expectedResult);
      expect(service.guardarRegistro).toHaveBeenCalledWith(proyectoId, file);
    });
  });

  describe('obtenerArchivo', () => {
    it('debería transmitir un archivo', async () => {
      const docId = 1;
      const doc = { id: 1, ruta_archivo: 'uploads/test.pdf' };
      const res = { setHeader: jest.fn(), pipe: jest.fn() } as unknown as Response;
      const stream = { pipe: jest.fn() } as unknown as ReadStream;

      mockDocumentosService.obtenerUno.mockResolvedValue(doc);
      (createReadStream as jest.Mock).mockReturnValue(stream);
      
      await controller.obtenerArchivo(docId, res);

      expect(service.obtenerUno).toHaveBeenCalledWith(docId);
      expect(createReadStream).toHaveBeenCalledWith(join(process.cwd(), doc.ruta_archivo));
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(stream.pipe).toHaveBeenCalledWith(res);
    });

     it('debería manejar los errores del servicio correctamente', async () => {
        const docId = 99;
        const res = {} as Response;
        mockDocumentosService.obtenerUno.mockRejectedValue(new Error('No encontrado'));
        
        await expect(controller.obtenerArchivo(docId, res)).rejects.toThrow('No encontrado');
    });
  });
});

