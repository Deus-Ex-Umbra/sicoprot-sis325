import { Test, TestingModule } from '@nestjs/testing';
import { AutenticacionService } from '../src/modulos/autenticacion/autenticacion.servicio';
import { UsuariosService } from '../src/modulos/usuarios/usuarios.servicio';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from '../src/modulos/usuarios/entidades/usuario.entidad';
import { Estudiante } from '../src/modulos/estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../src/modulos/asesores/entidades/asesor.entidad';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Rol } from '../src/modulos/usuarios/enums/rol.enum';
import { IniciarSesionDto } from '../src/modulos/autenticacion/dto/iniciar-sesion.dto';
import { RegistroDto } from '../src/modulos/autenticacion/dto/registro.dto';

jest.mock('bcrypt');

describe('AutenticacionServicio', () => {
  let service: AutenticacionService;
  let usuariosService: UsuariosService;

  const mockUsuariosService = {
    buscarPorCorreo: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('test_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutenticacionService,
        { provide: UsuariosService, useValue: mockUsuariosService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: getRepositoryToken(Usuario), useValue: mockRepository },
        { provide: getRepositoryToken(Estudiante), useValue: mockRepository },
        { provide: getRepositoryToken(Asesor), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AutenticacionService>(AutenticacionService);
    usuariosService = module.get<UsuariosService>(UsuariosService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('iniciarSesion', () => {
    it('debería lanzar UnauthorizedException si el usuario no se encuentra', async () => {
      const dto: IniciarSesionDto = { correo: 'noexiste@test.com', contrasena: 'password' };
      mockUsuariosService.buscarPorCorreo.mockResolvedValue(undefined);
      await expect(service.iniciarSesion(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException si la contraseña no coincide', async () => {
      const dto: IniciarSesionDto = { correo: 'test@test.com', contrasena: 'wrongpassword' };
      const user = { id: 1, correo: 'test@test.com', contrasena: 'hashedpassword', rol: Rol.Estudiante };
      mockUsuariosService.buscarPorCorreo.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.iniciarSesion(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('debería devolver el token de acceso y los datos del usuario en un inicio de sesión exitoso', async () => {
      const dto: IniciarSesionDto = { correo: 'test@test.com', contrasena: 'password' };
      const user = { id: 1, correo: 'test@test.com', contrasena: 'hashedpassword', rol: Rol.Estudiante };
      mockUsuariosService.buscarPorCorreo.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      const result = await service.iniciarSesion(dto);
      
      expect(result).toHaveProperty('token_acceso', 'test_token');
      expect(result.usuario.correo).toBe(dto.correo);
      expect(result.usuario).not.toHaveProperty('contrasena');
    });
  });

  describe('registrarse', () => {
    it('debería registrar exitosamente a un nuevo estudiante y devolver un token', async () => {
      const dto: RegistroDto = {
        correo: 'new@test.com',
        contrasena: 'password',
        rol: Rol.Estudiante,
        nombre: 'Nuevo',
        apellido: 'Estudiante',
      };
      const user = { id: 1, ...dto };
      
      mockRepository.create.mockReturnValue(user);
      mockRepository.save.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      const result = await service.registrarse(dto);

      expect(result).toHaveProperty('token_acceso', 'test_token');
      expect(result.usuario.correo).toBe(dto.correo);
      expect(mockRepository.save).toHaveBeenCalledTimes(2);
    });

    it('debería lanzar BadRequestException si el correo ya está en uso', async () => {
        const dto: RegistroDto = {
            correo: 'new@test.com',
            contrasena: 'password',
            rol: Rol.Estudiante,
            nombre: 'Nuevo',
            apellido: 'Estudiante',
        };
        mockRepository.save.mockRejectedValue({ code: '23505' });
        await expect(service.registrarse(dto)).rejects.toThrow(BadRequestException);
    });

     it('debería registrar exitosamente a un nuevo asesor y devolver un token', async () => {
        const dto: RegistroDto = {
            correo: 'new.asesor@test.com',
            contrasena: 'password',
            rol: Rol.Asesor,
            nombre: 'Nuevo',
            apellido: 'Asesor',
        };
        const user = { id: 2, ...dto };
        mockRepository.create.mockReturnValue(user);
        mockRepository.save.mockResolvedValue(user);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
        
        const result = await service.registrarse(dto);

        expect(result.usuario.rol).toBe(Rol.Asesor);
        expect(result.usuario.perfil).toHaveProperty('id_asesor');
     });
  });

  describe('cerrarSesion', () => {
    it('debería devolver un mensaje de éxito', () => {
        expect(service.cerrarSesion()).toEqual({ message: 'Sesión cerrada exitosamente.' });
    });
  });
});

