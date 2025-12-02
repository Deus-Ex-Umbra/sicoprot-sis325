// src/observaciones/observaciones.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObservacionesService } from './observaciones.servicio';
import { Observacion } from './entidades/observacion.entidad';
import { Documento } from '../documentos/entidades/documento.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Proyecto } from '../proyectos/entidades/proyecto.endidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CrearObservacionDto } from './dto/crear-observacion.dto';
import { EstadoObservacion } from './enums/estado-observacion.enum';
import { EtapaProyecto } from '../proyectos/enums/etapa-proyecto.enum';

// Mocks
const mockDocumentoRepository = {
    findOne: jest.fn(),
};
const mockAsesorRepository = {
    findOne: jest.fn(),
};
const mockObservacionRepository = {
    create: jest.fn(),
    save: jest.fn(),
};
const mockEstudianteRepository = {
    findOne: jest.fn(),
};
const mockProyectoRepository = {
    findOne: jest.fn(),
};

describe('ObservacionesService', () => {
    let service: ObservacionesService;
    let observacionRepo: Repository<Observacion>;
    let documentoRepo: Repository<Documento>;
    let asesorRepo: Repository<Asesor>;
    let estudianteRepo: Repository<Estudiante>;
    let proyectoRepo: Repository<Proyecto>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        providers: [
            ObservacionesService,
            {
            provide: getRepositoryToken(Observacion),
            useValue: mockObservacionRepository,
            },
            {
            provide: getRepositoryToken(Documento),
            useValue: mockDocumentoRepository,
            },
            {
            provide: getRepositoryToken(Asesor),
            useValue: mockAsesorRepository,
            },
            {
            provide: getRepositoryToken(Estudiante),
            useValue: mockEstudianteRepository,
            },
            {
            provide: getRepositoryToken(Proyecto),
            useValue: mockProyectoRepository,
            },
        ],
        }).compile();

        service = module.get<ObservacionesService>(ObservacionesService);
        observacionRepo = module.get(getRepositoryToken(Observacion));
        documentoRepo = module.get(getRepositoryToken(Documento));
        asesorRepo = module.get(getRepositoryToken(Asesor));
        estudianteRepo = module.get(getRepositoryToken(Estudiante));
        proyectoRepo = module.get(getRepositoryToken(Proyecto));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('crear', () => {
        const id_usuario = 100;
        const id_documento = 1;
        const dto: CrearObservacionDto = {
        titulo: 'Observación de prueba',
        contenido_html: '<p>Contenido de la observación</p>',
        x_inicio: 10.5,
        y_inicio: 20.3,
        x_fin: 150.8,
        y_fin: 45.2,
        pagina_inicio: 2,
        pagina_fin: 2,
        descripcion_corta: 'Corrección menor',
        color: '#FF0000',
        };

        it('debe lanzar NotFoundException si el documento no existe', async () => {
        mockDocumentoRepository.findOne.mockResolvedValue(null);

        await expect(
            service.crear(id_documento, dto, id_usuario),
        ).rejects.toThrow(
            new NotFoundException(`Documento con ID '${id_documento}' no encontrado.`),
        );
        });

        it('debe lanzar ForbiddenException si el usuario no es asesor', async () => {
        const documentoMock = {
            id: id_documento,
            version: 2,
            proyecto: { id: 1, etapa_actual: EtapaProyecto.PERFIL } as Proyecto,
        } as Documento;

        mockDocumentoRepository.findOne.mockResolvedValue(documentoMock);
        mockAsesorRepository.findOne.mockResolvedValue(null);

        await expect(
            service.crear(id_documento, dto, id_usuario),
        ).rejects.toThrow(
            new ForbiddenException('Solo los asesores pueden crear observaciones.'),
        );
        });

        it('debe crear la observación correctamente si todo es válido', async () => {
        const documentoMock = {
            id: id_documento,
            version: 2,
            proyecto: { id: 1, etapa_actual: EtapaProyecto.PERFIL } as Proyecto,
        } as Documento;

        const asesorMock = { id: 50, usuario: { id: id_usuario } } as Asesor;

        const observacionEsperada = {
            id: 1,
            ...dto,
            contenido_html: dto.contenido_html,
            descripcion_corta: dto.descripcion_corta,
            documento: documentoMock,
            proyecto: documentoMock.proyecto,
            autor: asesorMock,
            version_observada: documentoMock.version,
            etapa_observada: documentoMock.proyecto.etapa_actual,
            estado: EstadoObservacion.PENDIENTE,
            color: dto.color,
            archivada: false,
            fecha_creacion: expect.any(Date),
            fecha_actualizacion: expect.any(Date),
            // Campos opcionales
            comentarios_asesor_html: undefined,
            version_corregida: undefined,
            fecha_verificacion: undefined,
            comentario_verificacion_html: undefined,
        } as Observacion;

        mockDocumentoRepository.findOne.mockResolvedValue(documentoMock);
        mockAsesorRepository.findOne.mockResolvedValue(asesorMock);
        mockObservacionRepository.create.mockReturnValue(observacionEsperada);
        mockObservacionRepository.save.mockResolvedValue(observacionEsperada);

        const result = await service.crear(id_documento, dto, id_usuario);

        expect(result).toEqual(observacionEsperada);
        expect(mockObservacionRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
            titulo: dto.titulo,
            contenido_html: dto.contenido_html,
            documento: documentoMock,
            autor: asesorMock,
            estado: EstadoObservacion.PENDIENTE,
            version_observada: documentoMock.version,
            }),
        );
        expect(mockObservacionRepository.save).toHaveBeenCalledWith(observacionEsperada);
        });
    });
});