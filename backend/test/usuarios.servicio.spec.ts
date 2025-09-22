import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuariosService } from '../src/modulos/usuarios/usuarios.servicio';
import { Usuario } from '../src/modulos/usuarios/entidades/usuario.entidad';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CrearUsuarioDto } from '../src/modulos/usuarios/dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from '../src/modulos/usuarios/dto/actualizar-usuario.dto';
import * as bcrypt from 'bcrypt';
import { Rol } from '../src/modulos/usuarios/enums/rol.enum';

jest.mock('bcrypt');

describe('UsuariosServicio', () => {
  let service: UsuariosService;
  let repository: Repository<Usuario>;

  const mockUsuarioRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    preload: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    repository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('crear', () => {
    it('debería crear y devolver un usuario sin la contraseña', async () => {
      const dto: CrearUsuarioDto = {
        correo: 'test@test.com',
        contrasena: 'password',
        rol: Rol.Estudiante,
        nombre: 'Test',
        apellido: 'User',
      };
      const user = { id: 1, ...dto };
      
      mockUsuarioRepository.create.mockReturnValue(user);
      mockUsuarioRepository.save.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      const result = await service.crear(dto);
      
      expect(result).not.toHaveProperty('contrasena');
      expect(mockUsuarioRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException por correo duplicado', async () => {
        const dto: CrearUsuarioDto = { correo: 'test@test.com' } as any;
        mockUsuarioRepository.save.mockRejectedValue({ code: '23505' });
        await expect(service.crear(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('obtenerUno', () => {
    it('debería devolver un usuario si se encuentra', async () => {
      const user = { id: 1 };
      mockUsuarioRepository.findOneBy.mockResolvedValue(user);
      expect(await service.obtenerUno(1)).toEqual(user);
    });

    it('debería lanzar NotFoundException si no se encuentra el usuario', async () => {
      mockUsuarioRepository.findOneBy.mockResolvedValue(null);
      await expect(service.obtenerUno(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizar', () => {
    it('debería actualizar un usuario', async () => {
        const dto: ActualizarUsuarioDto = { correo: 'updated@test.com' };
        const user = { id: 1, correo: 'original@test.com' };

        mockUsuarioRepository.preload.mockResolvedValue({ ...user, ...dto });
        mockUsuarioRepository.save.mockResolvedValue({ id: 1, ...dto });

        const result = await service.actualizar(1, dto);
        expect(result.correo).toBe('updated@test.com');
    });

    it('debería hashear la contraseña si se proporciona', async () => {
        const dto: ActualizarUsuarioDto = { contrasena: 'newpassword' };
        mockUsuarioRepository.preload.mockResolvedValue({ id: 1 });
        mockUsuarioRepository.save.mockResolvedValue({ id: 1 });
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashednewpassword');
        
        await service.actualizar(1, dto);
        expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
    });

    it('debería lanzar NotFoundException si no se encuentra el usuario a actualizar', async () => {
        mockUsuarioRepository.preload.mockResolvedValue(null);
        await expect(service.actualizar(99, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminar', () => {
    it('debería eliminar un usuario', async () => {
        mockUsuarioRepository.delete.mockResolvedValue({ affected: 1 });
        const result = await service.eliminar(1);
        expect(result).toEqual({ message: `Usuario con ID '1' eliminado.` });
    });

    it('debería lanzar NotFoundException si no se encuentra el usuario a eliminar', async () => {
        mockUsuarioRepository.delete.mockResolvedValue({ affected: 0 });
        await expect(service.eliminar(99)).rejects.toThrow(NotFoundException);
    });
  });
});

