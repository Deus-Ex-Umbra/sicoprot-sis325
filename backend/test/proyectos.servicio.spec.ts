import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProyectosService } from '../src/modulos/proyectos/proyectos.servicio';
import { Proyecto } from '../src/modulos/proyectos/entidades/proyecto.endidad';
import { Estudiante } from '../src/modulos/estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../src/modulos/asesores/entidades/asesor.entidad';
import { NotFoundException } from '@nestjs/common';

describe('ProyectosServicio', () => {
  let service: ProyectosService;
  let proyectoRepo: Repository<Proyecto>;
  let estudianteRepo: Repository<Estudiante>;
  let asesorRepo: Repository<Asesor>;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProyectosService,
        { provide: getRepositoryToken(Proyecto), useValue: mockRepo },
        { provide: getRepositoryToken(Estudiante), useValue: mockRepo },
        { provide: getRepositoryToken(Asesor), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ProyectosService>(ProyectosService);
    proyectoRepo = module.get<Repository<Proyecto>>(getRepositoryToken(Proyecto));
    estudianteRepo = module.get<Repository<Estudiante>>(getRepositoryToken(Estudiante));
    asesorRepo = module.get<Repository<Asesor>>(getRepositoryToken(Asesor));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('crear', () => {
    it('debería crear un proyecto', async () => {
        const dto = { titulo: 'Test', id_asesor: 1 };
        const estudiante = { id: 1 };
        const asesor = { id: 1 };
        jest.spyOn(estudianteRepo, 'findOne').mockResolvedValue(estudiante as any);
        jest.spyOn(asesorRepo, 'findOneBy').mockResolvedValue(asesor as any);
        jest.spyOn(proyectoRepo, 'create').mockReturnValue({} as any);
        jest.spyOn(proyectoRepo, 'save').mockResolvedValue({ id: 1 } as any);

        await service.crear(dto, 1);
        expect(proyectoRepo.save).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el estudiante no se encuentra', async () => {
        jest.spyOn(estudianteRepo, 'findOne').mockResolvedValue(null);
        await expect(service.crear({} as any, 99)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar NotFoundException si el asesor no se encuentra', async () => {
        jest.spyOn(estudianteRepo, 'findOne').mockResolvedValue({ id: 1 } as any);
        jest.spyOn(asesorRepo, 'findOneBy').mockResolvedValue(null);
        await expect(service.crear({ id_asesor: 99 } as any, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('obtenerTodos', () => {
    it('debería devolver todos los proyectos', async () => {
        jest.spyOn(proyectoRepo, 'find').mockResolvedValue([{ id: 1 }] as any);
        const result = await service.obtenerTodos();
        expect(result).toHaveLength(1);
    });
  });

  describe('obtenerUno', () => {
    it('debería devolver un proyecto', async () => {
        jest.spyOn(proyectoRepo, 'findOne').mockResolvedValue({ id: 1 } as any);
        const result = await service.obtenerUno(1);
        expect(result).toBeDefined();
        expect(result.id).toBe(1);
    });

    it('debería lanzar NotFoundException si el proyecto no se encuentra', async () => {
        jest.spyOn(proyectoRepo, 'findOne').mockResolvedValue(null);
        await expect(service.obtenerUno(99)).rejects.toThrow(NotFoundException);
    });
  });
});

