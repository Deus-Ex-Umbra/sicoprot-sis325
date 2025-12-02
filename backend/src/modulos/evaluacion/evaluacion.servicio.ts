import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluacionTribunal } from './entidades/evaluacion-tribunal.entity';
import { Proyecto } from '../proyectos/entidades/proyecto.endidad';
import { CrearEvaluacionDto } from './dto/crear-evaluacion.dto';
import { EtapaProyecto } from '../proyectos/enums/etapa-proyecto.enum'; // ajusta la ruta
@Injectable()
export class EvaluacionTribunalService {
  constructor(
    @InjectRepository(EvaluacionTribunal)
    private evaluacionRepository: Repository<EvaluacionTribunal>,
    @InjectRepository(Proyecto)
    private proyectoRepository: Repository<Proyecto>,
  ) {}

  async crearEvaluacion(tribunalId: number, proyectoId: number, dto: CrearEvaluacionDto) {
    const proyecto = await this.proyectoRepository.findOne({
      where: { id: proyectoId, etapa_actual: EtapaProyecto.LISTO_DEFENSA },
      relations: ['tribunales'],
    });

    if (!proyecto) {
      throw new NotFoundException('El proyecto no existe o no está listo para defensa');
    }

    const esTribunal = proyecto.tribunales.some(t => t.id === tribunalId);
    if (!esTribunal) {
      throw new ForbiddenException('No estás asignado como tribunal de este proyecto');
    }

    const evaluacion = this.evaluacionRepository.create({
      ...dto,
      tribunal: { id: tribunalId },
      proyecto: { id: proyectoId },
    });

    return this.evaluacionRepository.save(evaluacion);
  }

  async listarProyectosDeTribunal(tribunalId: number) {
    // Asumiendo que hay una relación muchos-a-muchos entre Proyecto y Usuario (tribunal)
    // y que `tribunales` es la relación inversa en Proyecto
    const proyectos = await this.proyectoRepository.find({
      where: { etapa_actual: EtapaProyecto.LISTO_DEFENSA },
      relations: ['tribunales'],
    });

    return proyectos.filter(p => p.tribunales.some(t => t.id === tribunalId));
  }
}