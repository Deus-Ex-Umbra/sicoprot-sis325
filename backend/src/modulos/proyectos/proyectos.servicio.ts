import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from './entidades/proyecto.endidad';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';
import { UsuariosService } from '../usuarios/usuarios.servicio';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectoRepositorio: Repository<Proyecto>,
    private readonly usuariosService: UsuariosService,
  ) {}

  async crear(crearProyectoDto: CrearProyectoDto) {
    const { estudianteId, asesorId, titulo } = crearProyectoDto;
    const estudiante = await this.usuariosService.obtenerUno(estudianteId);
    const asesor = await this.usuariosService.obtenerUno(asesorId);

    const nuevoProyecto = this.proyectoRepositorio.create({
      titulo,
      estudiante,
      asesor,
    });

    return this.proyectoRepositorio.save(nuevoProyecto);
  }

  async obtenerUno(id: string) {
    const proyecto = await this.proyectoRepositorio.findOneBy({ id });
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID '${id}' no encontrado.`);
    }
    return proyecto;
  }
}