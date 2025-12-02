import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AsesoresService } from './asesores.servicio';
import { Asesor } from './entidades/asesor.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { ForbiddenException } from '@nestjs/common';

// Mock del repositorio
const mockAsesorRepository = {
    findOne: jest.fn(),
};

const mockEstudianteRepository = {
  // No se usa directamente en este método, pero se inyecta
};

describe('AsesoresService', () => {
    let service: AsesoresService;
    let asesorRepository: Repository<Asesor>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        providers: [
            AsesoresService,
            {
            provide: getRepositoryToken(Asesor),
            useValue: mockAsesorRepository,
            },
            {
            provide: getRepositoryToken(Estudiante),
            useValue: mockEstudianteRepository,
            },
        ],
        }).compile();

        service = module.get<AsesoresService>(AsesoresService);
        asesorRepository = module.get<Repository<Asesor>>(getRepositoryToken(Asesor));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('obtenerEstudiantesDeMiGrupo', () => {
        it('debe lanzar ForbiddenException si el usuario no es asesor', async () => {
        mockAsesorRepository.findOne.mockResolvedValue(null);

        await expect(service.obtenerEstudiantesDeMiGrupo(123)).rejects.toThrow(
            new ForbiddenException('Solo los asesores pueden acceder a esta información.'),
        );
        });

        it('debe devolver { grupos: [] } si el asesor no tiene grupos', async () => {
        // const mockAsesor = { id: 1, grupos: [] } as Asesor;
        const mockAsesor = { id: 1,
        grupos: [],
        // Añade solo lo mínimo que TypeORM espera para evitar errores en el mock
        nombre: 'Mock',
        apellido: 'Asesor',
        ruta_foto: null,
        usuario: { id: 123 } as any, // no se usa, pero evita error
        proyectos_asesorados: [],
        observaciones_realizadas: [],
        reuniones_agendadas: [],
        } as Asesor;
        mockAsesorRepository.findOne.mockResolvedValue(mockAsesor);

        const result = await service.obtenerEstudiantesDeMiGrupo(123);
        expect(result).toEqual({ grupos: [] });
        });

        it('debe devolver la estructura correcta de grupos y estudiantes cuando existen', async () => {
        const mockAsesor = {
            id: 1,
            grupos: [
            {
                id: 10,
                nombre: 'Grupo A',
                tipo: 'Tesis',
                descripcion: 'Grupo de tesis 2025',
                activo: true,
                periodo: { id: 1, nombre: '2025-1' },
                estudiantes: [
                {
                    id: 100,
                    nombre: 'Ana',
                    apellido: 'López',
                    usuario: { correo: 'ana@example.com' },
                    proyecto: { titulo: 'Sistema de Gestión Académica' },
                },
                {
                    id: 101,
                    nombre: 'Luis',
                    apellido: 'Mora',
                    usuario: null, // caso sin correo
                    proyecto: null, // caso sin proyecto
                },
                ],
            },
            ],
        } as unknown as Asesor;

        mockAsesorRepository.findOne.mockResolvedValue(mockAsesor);

        const result = await service.obtenerEstudiantesDeMiGrupo(123);

        expect(result).toEqual({
            grupos: [
            {
                id: 10,
                nombre: 'Grupo A',
                tipo: 'Tesis',
                descripcion: 'Grupo de tesis 2025',
                activo: true,
                periodo: { id: 1, nombre: '2025-1' },
                estudiantes: [
                {
                    id: 100,
                    nombre: 'Ana',
                    apellido: 'López',
                    correo: 'ana@example.com',
                    proyecto: 'Sistema de Gestión Académica',
                },
                {
                    id: 101,
                    nombre: 'Luis',
                    apellido: 'Mora',
                    correo: 'Sin correo',
                    proyecto: 'Sin proyecto',
                },
                ],
            },
            ],
        });
        });
    });
});