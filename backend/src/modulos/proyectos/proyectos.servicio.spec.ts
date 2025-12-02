import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProyectosService } from './proyectos.servicio';
import { Proyecto } from './entidades/proyecto.endidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Observacion } from '../observaciones/entidades/observacion.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Documento } from '../documentos/entidades/documento.entidad';
import { NotFoundException } from '@nestjs/common';
import { EstadoObservacion } from '../observaciones/enums/estado-observacion.enum';
import { EtapaProyecto } from './enums/etapa-proyecto.enum';

import { Usuario } from '../usuarios/entidades/usuario.entidad';
import { Grupo } from '../grupos/entidades/grupo.entidad';
import { Reunion } from '../reuniones/entidades/reunion.entidad';
// Mocks
const mockEstudianteRepository = {
    findOne: jest.fn(),
};
const mockProyectoRepository = {
    findOne: jest.fn(),
};
const mockObservacionRepository = {
    find: jest.fn(),
};
const mockAsesorRepository = {
    findOne: jest.fn(),
};
const mockDocumentoRepository = {
    findOne: jest.fn(),
};
const mockUsuarioRepository = {
    findOne: jest.fn(),
};
const mockGrupoRepository = {
    find: jest.fn(),
};
const mockReunionRepository = {
    find: jest.fn(),
};

// Mock del servicio de observaciones (solo el método que se usa)
const mockObservacionesService = {
    contarObservacionesPendientes: jest.fn(),
};

describe('ProyectosService', () => {
    let service: ProyectosService;
    let estudianteRepo: Repository<Estudiante>;
    let proyectoRepo: Repository<Proyecto>;
    let observacionRepo: Repository<Observacion>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        providers: [
            ProyectosService,
            {
            provide: getRepositoryToken(Estudiante),
            useValue: mockEstudianteRepository,
            },
            {
            provide: getRepositoryToken(Proyecto),
            useValue: mockProyectoRepository,
            },
            {
            provide: getRepositoryToken(Observacion),
            useValue: mockObservacionRepository,
            },
            {
            provide: getRepositoryToken(Asesor),
            useValue: mockAsesorRepository,
            },
            {
            provide: getRepositoryToken(Documento),
            useValue: mockDocumentoRepository,
            },
            {
            provide: getRepositoryToken(Usuario),
            useValue: mockUsuarioRepository,
            },
            {
            provide: getRepositoryToken(Grupo),
            useValue: mockGrupoRepository,
            },
            {
            provide: getRepositoryToken(Reunion),
            useValue: mockReunionRepository,
            },
            {
            provide: 'ObservacionesService',
            useValue: mockObservacionesService,
            },
            {
            provide: 'GruposService',
            useValue: {},
            },
        ],
        }).compile();

        service = module.get<ProyectosService>(ProyectosService);
        estudianteRepo = module.get(getRepositoryToken(Estudiante));
        proyectoRepo = module.get(getRepositoryToken(Proyecto));
        observacionRepo = module.get(getRepositoryToken(Observacion));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('obtenerHistorialProgreso', () => {
        const id_usuario = 100;

        it('debe lanzar NotFoundException si el estudiante no tiene proyecto asignado', async () => {
            mockEstudianteRepository.findOne.mockResolvedValue(null);

            await expect(
                service.obtenerHistorialProgreso(id_usuario),
            ).rejects.toThrow(
                new NotFoundException('No tienes un proyecto asignado'),
            );
        });

    it('debe devolver el historial de progreso cuando todo es válido', async () => {
        const proyectoMock = {
            id: 1,
            titulo: 'Sistema Académico',
            cuerpo_html: '<p>Proyecto de tesis</p>',
            fecha_creacion: new Date('2025-09-15'),
            estudiantes: [],
            asesor: {} as Asesor,
            documentos: [],
            reuniones: [],
            observaciones: [],
            etapa_actual: EtapaProyecto.PERFIL,
            propuesta_aprobada: true,
            perfil_aprobado: false,
            proyecto_aprobado: false,
            listo_para_defender: false,
            palabras_clave: [],
            ruta_memorial: '',
            comentarios_defensa: '', // ✅ string vacío
            tribunales: [], // ✅ array vacío (no undefined)
            // Fechas
            fecha_aprobacion_propuesta: new Date('2025-10-01'),
            fecha_aprobacion_perfil: undefined,
            fecha_aprobacion_proyecto: undefined,
            comentario_aprobacion_propuesta: 'Tema aprobado',
            comentario_aprobacion_perfil: undefined,
            comentario_aprobacion_proyecto: undefined,
            propuesta_aprobada_fecha: undefined,
            perfil_aprobado_fecha: undefined,
            proyecto_aprobado_fecha: undefined,
        } as Proyecto;const observacion1 = {
            id: 1,
            titulo: 'Falta justificación teórica',
            contenido_html: '<p>Falta la base teórica</p>',
            estado: EstadoObservacion.CORREGIDA,
            etapa_observada: EtapaProyecto.PROPUESTA,
            fecha_creacion: new Date('2025-10-05'),
            fecha_actualizacion: new Date('2025-10-08'),
            fecha_verificacion: new Date('2025-10-08'),
            comentario_verificacion_html: 'Corregido.',
            comentarios_asesor_html: 'Corregir esto.',
            version_observada: 1,
            version_corregida: 2,
            archivada: false,
            // ✅ Usa números, NO null
            x_inicio: 0,
            y_inicio: 0,
            x_fin: 0,
            y_fin: 0,
            pagina_inicio: 0,
            pagina_fin: 0,
            descripcion_corta: 'Falta teoría',
            color: '#FFD700',
            autor: { id: 50 } as Asesor,
            documento: { nombre_archivo: 'propuesta_v2.pdf', id: 1 } as Documento,
            proyecto: null,
            correcciones: [],
        } as Observacion;
        const observacion2 = {
            id: 2,
            titulo: 'Error en metodología',
            contenido_html: '<p>Revisar sección 3</p>',
            estado: EstadoObservacion.PENDIENTE,
            etapa_observada: EtapaProyecto.PERFIL,
            fecha_creacion: new Date('2025-10-20'),
            fecha_actualizacion: new Date('2025-10-20'),
            // ✅ Usa undefined, NO null
            fecha_verificacion: undefined,
            comentario_verificacion_html: undefined,
            comentarios_asesor_html: 'Revisar sección 3.',
            version_observada: 1,
            version_corregida: undefined, // ✅
            archivada: false,
            x_inicio: 0,
            y_inicio: 0,
            x_fin: 0,
            y_fin: 0,
            pagina_inicio: 0,
            pagina_fin: 0,
            descripcion_corta: 'Metodología errónea',
            color: '#FF0000',
            autor: { id: 50 } as Asesor,
            documento: { nombre_archivo: 'perfil_v1.pdf', id: 2 } as Documento,
            proyecto: null, // ✅ solo si corregiste la entidad a Proyecto | null
            correcciones: [],
            } as Observacion;
        const estudianteMock = {
            id: 200,
            nombre: 'Juan',
            apellido: 'Pérez',
            // ✅ Incluye ruta_foto (aunque sea nullable, no tiene ? en TS)
            ruta_foto: '', // o null si corriges la entidad, pero por ahora usa string vacío
            usuario: { id: id_usuario } as Usuario,
            proyecto: proyectoMock, // o null si corregiste Proyecto | null
            grupos: [], // ✅ ya lo tienes
            // ✅ Incluye correcciones (array obligatorio)
            correcciones: [], // array vacío
        } as Estudiante;
        mockEstudianteRepository.findOne.mockResolvedValue(estudianteMock);
        mockObservacionRepository.find.mockResolvedValue([observacion1, observacion2]);

        const result = await service.obtenerHistorialProgreso(id_usuario);

        expect(result).toEqual({
            avances: [
            {
                etapa: 'propuesta',
                estado: 'aprobado',
                fecha: proyectoMock.fecha_aprobacion_propuesta,
                comentarios: proyectoMock.comentario_aprobacion_propuesta,
            },
            {
                etapa: 'perfil',
                estado: 'pendiente',
                fecha: null,
                comentarios: null,
            },
            {
                etapa: 'proyecto',
                estado: 'pendiente',
                fecha: null,
                comentarios: null,
            },
            ],
            revisiones: [
            {
                id: 1,
                titulo: 'Falta justificación teórica',
                estado: EstadoObservacion.CORREGIDA,
                etapa_observada: EtapaProyecto.PROPUESTA,
                fecha_creacion: observacion1.fecha_creacion,
                fecha_verificacion: observacion1.fecha_verificacion,
                documento: 'propuesta_v2.pdf',
                version_observada: 1,
                version_corregida: 2,
                comentarios_asesor: 'Corregir esto.',
                comentario_verificacion: 'Corregido.',
            },
            {
                id: 2,
                titulo: 'Error en metodología',
                estado: EstadoObservacion.PENDIENTE,
                etapa_observada: EtapaProyecto.PERFIL,
                fecha_creacion: observacion2.fecha_creacion,
                fecha_verificacion: null,
                documento: 'perfil_v1.pdf',
                version_observada: 1,
                version_corregida: null,
                comentarios_asesor: 'Revisar sección 3.',
                comentario_verificacion: null,
            },
            ],
            defensa: {
            completada: false,
            fecha: null,
            comentarios: null,
            },
        });
        });
    });
});