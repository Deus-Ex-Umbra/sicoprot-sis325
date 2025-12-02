// src/usuarios/usuarios.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.servicio';
import { Usuario } from './entidades/usuario.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Rol } from './enums/rol.enum';
import { EstadoUsuario } from './enums/estado-usuario.enum';
import * as bcrypt from 'bcrypt';

// Mock de bcrypt
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(true),
}));

// Mocks de repositorios
const mockUsuarioRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(), // ✅ usa findOneBy
    find: jest.fn(),
    preload: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
};

const mockEstudianteRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
};

const mockAsesorRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
};

describe('UsuariosService', () => {
    let service: UsuariosService;
    let usuarioRepo: Repository<Usuario>;
    let estudianteRepo: Repository<Estudiante>;
    let asesorRepo: Repository<Asesor>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        providers: [
            UsuariosService,
            {
            provide: getRepositoryToken(Usuario),
            useValue: mockUsuarioRepository,
            },
            {
            provide: getRepositoryToken(Estudiante),
            useValue: mockEstudianteRepository,
            },
            {
            provide: getRepositoryToken(Asesor),
            useValue: mockAsesorRepository,
            },
        ],
        }).compile();

        service = module.get<UsuariosService>(UsuariosService);
        usuarioRepo = module.get(getRepositoryToken(Usuario));
        estudianteRepo = module.get(getRepositoryToken(Estudiante));
        asesorRepo = module.get(getRepositoryToken(Asesor));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('crear', () => {
    const dto: CrearUsuarioDto = {
        correo: 'test@example.com',
        contrasena: '12345678',
        rol: Rol.Estudiante,
        nombre: 'Juan',
        apellido: 'Pérez',
    };

    it('debe crear un usuario con la contraseña hasheada', async () => {
        const nuevoUsuario = {
            id: 1,
            correo: dto.correo,
            rol: dto.rol,
            estado: EstadoUsuario.Pendiente, // ✅ obligatorio
            contrasena: 'hashed_password',
            creado_en: new Date(),
            actualizado_en: new Date(),
            ruta_foto: null,
            // ✅ Usa undefined o una fecha, no null
            fecha_aprobacion: undefined as any, // o new Date()
            estudiante: null,
            asesor: null,
        } as Usuario;
        mockUsuarioRepository.create.mockReturnValue(nuevoUsuario);
        mockUsuarioRepository.save.mockResolvedValue(nuevoUsuario);

        const result = await service.crear(dto);

        expect(bcrypt.hash).toHaveBeenCalledWith(dto.contrasena, 10);
        expect(mockUsuarioRepository.create).toHaveBeenCalledWith({
        correo: dto.correo,
        rol: dto.rol,
        contrasena: 'hashed_password',
        // nombre y apellido se pasan, pero Usuario no los tiene → OK
        });
        expect(result).toEqual({
        id: 1,
        correo: dto.correo,
        rol: dto.rol,
        creado_en: expect.any(Date),
        actualizado_en: expect.any(Date),
        ruta_foto: null,
        fecha_aprobacion: null,
        estudiante: null,
        asesor: null,
        });
    });
    });
    describe('obtenerPerfilCompleto', () => {
        it('debe devolver perfil de estudiante si el rol es Estudiante', async () => {
        const usuarioMock = {
            id: 1,
            correo: 'estudiante@example.com',
            rol: Rol.Estudiante,
            estado: EstadoUsuario.Activo, // ✅
            creado_en: new Date(),
            actualizado_en: new Date(),
            ruta_foto: null,
            fecha_aprobacion: null,
            contrasena: 'hashed',
            estudiante: {
                id: 10,
                nombre: 'Ana',
                apellido: 'López',
                ruta_foto: null,
                // Solo lo necesario para la prueba
            } as any,
            asesor: null,
            } as Usuario;
        // ✅ Usa findOneBy, no findOne
        mockUsuarioRepository.findOneBy.mockResolvedValue(usuarioMock);

        const result = await service.obtenerPerfilCompleto(1);

        expect(result.perfil).toBeDefined();
        expect(result.perfil.nombre).toBe('Ana');
        });

        it('debe devolver perfil de asesor si el rol es Asesor', async () => {
        const usuarioMock = {
            id: 2,
            correo: 'asesor@example.com',
            rol: Rol.Asesor, // ✅ enum
            estado: EstadoUsuario.Activo,
            creado_en: new Date(),
            actualizado_en: new Date(),
            ruta_foto: null,
            fecha_aprobacion: null,
            contrasena: 'hashed',
            estudiante: null,
            asesor: {
                id: 20,
                nombre: 'Carlos',
                apellido: 'Méndez',
                // Solo lo necesario
            } as any,
        } as Usuario;

        mockUsuarioRepository.findOneBy.mockResolvedValue(usuarioMock);

        const result = await service.obtenerPerfilCompleto(2);

        expect(result.perfil).toBeDefined();
        expect(result.perfil.nombre).toBe('Carlos');
        });

        it('debe lanzar NotFoundException si el usuario no existe', async () => {
        mockUsuarioRepository.findOneBy.mockResolvedValue(null); // ✅

        await expect(service.obtenerPerfilCompleto(999)).rejects.toThrow(
            new NotFoundException(`Usuario con ID '999' no encontrado.`),
        );
        });
    });
});