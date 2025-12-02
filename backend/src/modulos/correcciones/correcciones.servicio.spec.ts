import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CorreccionesService } from './correcciones.servicio';
import { Correccion } from './entidades/correccion.entidad';
import { Observacion } from '../observaciones/entidades/observacion.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Documento } from '../documentos/entidades/documento.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import {
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { EstadoObservacion } from '../observaciones/enums/estado-observacion.enum';
import { EstadoCorreccion } from './enums/estado-correccion.enum';
import { CrearCorreccionDto } from './dto/crear-correccion.dto';
// Mocks de repositorios
const mockObservacionRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
};

const mockCorreccionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
};

const mockEstudianteRepository = {
    findOne: jest.fn(),
};

const mockDocumentoRepository = {
    findOneBy: jest.fn(),
};

const mockAsesorRepository = {
    findOne: jest.fn(),
};

describe('CorreccionesService', () => {
    let service: CorreccionesService;
    let observacionRepo: Repository<Observacion>;
    let correccionRepo: Repository<Correccion>;
    let estudianteRepo: Repository<Estudiante>;
    let documentoRepo: Repository<Documento>;
    let asesorRepo: Repository<Asesor>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        providers: [
            CorreccionesService,
            {
            provide: getRepositoryToken(Correccion),
            useValue: mockCorreccionRepository,
            },
            {
            provide: getRepositoryToken(Observacion),
            useValue: mockObservacionRepository,
            },
            {
            provide: getRepositoryToken(Estudiante),
            useValue: mockEstudianteRepository,
            },
            {
            provide: getRepositoryToken(Documento),
            useValue: mockDocumentoRepository,
            },
            {
            provide: getRepositoryToken(Asesor),
            useValue: mockAsesorRepository,
            },
        ],
        }).compile();

        service = module.get<CorreccionesService>(CorreccionesService);
        observacionRepo = module.get(getRepositoryToken(Observacion));
        correccionRepo = module.get(getRepositoryToken(Correccion));
        estudianteRepo = module.get(getRepositoryToken(Estudiante));
        documentoRepo = module.get(getRepositoryToken(Documento));
        asesorRepo = module.get(getRepositoryToken(Asesor));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('crearPorObservacion', () => {
        const id_usuario = 100;
        const observacionId = 1;
        const dto: CrearCorreccionDto = {
        id_observacion: observacionId,
        descripcion_html: '<p>Corrección realizada con éxito.</p>',
        version_corregida: 2,
        x_inicio: 10.5,
        y_inicio: 20.3,
        x_fin: 150.8,
        y_fin: 45.2,
        pagina_inicio: 2,
        pagina_fin: 2,
        };
        it('debe lanzar NotFoundException si la observación no existe', async () => {
        mockObservacionRepository.findOne.mockResolvedValue(null);

        await expect(
            service.crearPorObservacion(observacionId, dto, id_usuario),
        ).rejects.toThrow(
            new NotFoundException(`Observación con ID ${observacionId} no encontrada`),
        );
        });

        it('debe lanzar BadRequestException si la observación no está en estado PENDIENTE o RECHAZADO', async () => {
        const observacion = {
            id: observacionId,
            estado: EstadoObservacion.CORREGIDA,
            documento: null,
            proyecto: null,
        } as unknown as Observacion;

        mockObservacionRepository.findOne.mockResolvedValue(observacion);

        await expect(
            service.crearPorObservacion(observacionId, dto, id_usuario),
        ).rejects.toThrow(
            new BadRequestException(
            `No se puede crear una corrección para una observación en estado ${observacion.estado}`,
            ),
        );
        });

        it('debe lanzar ForbiddenException si el usuario no es estudiante', async () => {
        const observacion = {
            id: observacionId,
            estado: EstadoObservacion.PENDIENTE,
            documento: null,
            proyecto: null,
        } as unknown as Observacion;

        mockObservacionRepository.findOne.mockResolvedValue(observacion);
        mockEstudianteRepository.findOne.mockResolvedValue(null);

        await expect(
            service.crearPorObservacion(observacionId, dto, id_usuario),
        ).rejects.toThrow(
            new ForbiddenException('Solo los estudiantes pueden crear correcciones'),
        );
        });

        it('debe lanzar ForbiddenException si el estudiante no pertenece al proyecto (Taller 1)', async () => {
        const estudianteMock = { id: 200, usuario: { id: id_usuario } } as Estudiante;
        const observacion = {
            id: observacionId,
            estado: EstadoObservacion.PENDIENTE,
            documento: {
            proyecto: {
                id: 1,
                estudiantes: [{ id: 999 }], // otro estudiante
            },
            },
            proyecto: null,
        } as unknown as Observacion;

        mockObservacionRepository.findOne.mockResolvedValue(observacion);
        mockEstudianteRepository.findOne.mockResolvedValue(estudianteMock);

        await expect(
            service.crearPorObservacion(observacionId, dto, id_usuario),
        ).rejects.toThrow(
            new ForbiddenException(
            'Solo los estudiantes del proyecto pueden crear correcciones para esta observación',
            ),
        );
        });

        it('debe lanzar NotFoundException si no se encuentra el documento con la versión corregida', async () => {
        const estudianteMock = { id: 200, usuario: { id: id_usuario } } as Estudiante;
        const observacion = {
            id: observacionId,
            estado: EstadoObservacion.PENDIENTE,
            documento: {
            proyecto: {
                id: 1,
                estudiantes: [{ id: 200 }],
            },
            },
            proyecto: null,
            version_observada: 1,
        } as unknown as Observacion;

        mockObservacionRepository.findOne.mockResolvedValue(observacion);
        mockEstudianteRepository.findOne.mockResolvedValue(estudianteMock);
        mockDocumentoRepository.findOneBy.mockResolvedValue(null);

        await expect(
            service.crearPorObservacion(observacionId, dto, id_usuario),
        ).rejects.toThrow(
            new NotFoundException(`No se encontró el documento versión ${dto.version_corregida} en el proyecto.`),
        );
        });

        it('debe lanzar BadRequestException si la versión corregida no es posterior a la versión observada', async () => {
        const estudianteMock = { id: 200, usuario: { id: id_usuario } } as Estudiante;
        const observacion = {
            id: observacionId,
            estado: EstadoObservacion.PENDIENTE,
            documento: {
            proyecto: {
                id: 1,
                estudiantes: [{ id: 200 }],
            },
            },
            proyecto: null,
            version_observada: 3,
        } as unknown as Observacion;

        const documentoMock = { version: 2 } as Documento;

        mockObservacionRepository.findOne.mockResolvedValue(observacion);
        mockEstudianteRepository.findOne.mockResolvedValue(estudianteMock);
        mockDocumentoRepository.findOneBy.mockResolvedValue(documentoMock);

        await expect(
            service.crearPorObservacion(observacionId, dto, id_usuario),
        ).rejects.toThrow(
            new BadRequestException(
            `La corrección debe estar en una versión posterior (v${documentoMock.version}) a la observación (v${observacion.version_observada}).`,
            ),
        );
        });

        it('debe crear la corrección y actualizar la observación si todo es válido (Taller 1)', async () => {
        const estudianteMock = { id: 200, usuario: { id: id_usuario } } as Estudiante;
        const documentoMock = { id: 10, version: 2 } as Documento;
        const observacion = {
            id: observacionId,
            estado: EstadoObservacion.PENDIENTE,
            documento: {
            proyecto: {
                id: 1,
                estudiantes: [{ id: 200 }],
            },
            },
            proyecto: null,
            version_observada: 1,
        } as unknown as Observacion;

        const ahora = new Date();

        const nuevaCorreccion = {
            id: 1,
            ...dto,
            observacion,
            estudiante: estudianteMock,
            documento: documentoMock,
            estado: EstadoCorreccion.PENDIENTE_REVISION,
            fecha_creacion: ahora,
            fecha_actualizacion: ahora,
            titulo: dto.titulo ?? undefined,
            color: dto.color ?? '#28a745',
            // 👇 Aquí está el cambio clave:
            estado_verificacion: undefined, // ✅ NO use null
            comentario_verificacion_html: undefined,
            fecha_verificacion: undefined,
            x_inicio: dto.x_inicio,
            y_inicio: dto.y_inicio,
            x_fin: dto.x_fin,
            y_fin: dto.y_fin,
            pagina_inicio: dto.pagina_inicio,
            pagina_fin: dto.pagina_fin,
        } as Correccion;
        mockObservacionRepository.findOne.mockResolvedValue(observacion);
        mockEstudianteRepository.findOne.mockResolvedValue(estudianteMock);
        mockDocumentoRepository.findOneBy.mockResolvedValue(documentoMock);
        mockCorreccionRepository.create.mockReturnValue(nuevaCorreccion);
        mockCorreccionRepository.save.mockResolvedValue(nuevaCorreccion);

        const result = await service.crearPorObservacion(observacionId, dto, id_usuario);

        expect(result).toEqual(nuevaCorreccion);
        expect(observacion.version_corregida).toBe(dto.version_corregida);
        expect(observacion.estado).toBe(EstadoObservacion.EN_REVISION);
        expect(mockObservacionRepository.save).toHaveBeenCalledWith(observacion);
        expect(mockCorreccionRepository.save).toHaveBeenCalledWith(nuevaCorreccion);
        });
    });
});