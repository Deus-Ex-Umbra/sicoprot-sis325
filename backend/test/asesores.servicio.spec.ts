import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsesoresService } from '../src/modulos/asesores/asesores.servicio';
import { Asesor } from '../src/modulos/asesores/entidades/asesor.entidad';
import { Usuario } from '../src/modulos/usuarios/entidades/usuario.entidad';
import { Rol } from '../src/modulos/usuarios/enums/rol.enum';

describe('AsesoresServicio', () => {
  let service: AsesoresService;
  let repository: Repository<Asesor>;

  const mockAsesorRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsesoresService,
        {
          provide: getRepositoryToken(Asesor),
          useValue: mockAsesorRepository,
        },
      ],
    }).compile();

    service = module.get<AsesoresService>(AsesoresService);
    repository = module.get<Repository<Asesor>>(getRepositoryToken(Asesor));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debería devolver un array de asesores formateados', async () => {
      const user = new Usuario();
      user.id = 1;
      user.correo = 'asesor@test.com';
      user.rol = Rol.Asesor;

      const asesor = new Asesor();
      asesor.id = 1;
      asesor.nombre = 'Test';
      asesor.apellido = 'Asesor';
      asesor.usuario = user;

      mockAsesorRepository.find.mockResolvedValue([asesor]);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: user.id,
        correo: user.correo,
        rol: user.rol,
        perfil: {
          id_asesor: asesor.id,
          nombre: asesor.nombre,
          apellido: asesor.apellido,
        },
      });
      expect(mockAsesorRepository.find).toHaveBeenCalledWith({ relations: ['usuario'] });
    });

    it('debería devolver un array vacío si no existen asesores', async () => {
      mockAsesorRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });

     it('debería manejar múltiples asesores correctamente', async () => {
        const user1 = new Usuario();
        user1.id = 1;
        user1.correo = 'asesor1@test.com';
        user1.rol = Rol.Asesor;
        const asesor1 = new Asesor();
        asesor1.id = 1;
        asesor1.nombre = 'Asesor';
        asesor1.apellido = 'Uno';
        asesor1.usuario = user1;

        const user2 = new Usuario();
        user2.id = 2;
        user2.correo = 'asesor2@test.com';
        user2.rol = Rol.Asesor;
        const asesor2 = new Asesor();
        asesor2.id = 2;
        asesor2.nombre = 'Asesor';
        asesor2.apellido = 'Dos';
        asesor2.usuario = user2;

        mockAsesorRepository.find.mockResolvedValue([asesor1, asesor2]);

        const result = await service.findAll();
        expect(result).toHaveLength(2);
        expect(result[1].correo).toBe('asesor2@test.com');
        expect(result[1].perfil.id_asesor).toBe(2);
    });
  });
});

