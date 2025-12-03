import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from '../proyectos/entidades/proyecto.endidad';
import { EtapaProyecto } from '../proyectos/enums/etapa-proyecto.enum';

@Injectable()
export class ReportesServicio {
  constructor(
    @InjectRepository(Proyecto)
    private proyectoRepositorio: Repository<Proyecto>,
  ) {}

  private calcularPorcentajeAvance(etapa: EtapaProyecto): number {
    switch (etapa) {
      case EtapaProyecto.PROPUESTA: return 10;
      case EtapaProyecto.PERFIL: return 30;
      case EtapaProyecto.PROYECTO: return 60;
      case EtapaProyecto.LISTO_DEFENSA: return 80;
      case EtapaProyecto.SOLICITUD_DEFENSA: return 90;
      case EtapaProyecto.TERMINADO: return 100;
      default: return 0;
    }
  }

  async obtenerAvanceGrupos() {
    const proyectos = await this.proyectoRepositorio.find();
    
    // Retornamos el avance de cada proyecto individualmente
    // El frontend espera { nombre: string, avance: number }
    return proyectos.map(p => ({
      nombre: p.titulo,
      avance: this.calcularPorcentajeAvance(p.etapa_actual)
    }));
  }

  async obtenerTiemposRevision() {
    const proyectos = await this.proyectoRepositorio.find({
      select: ['id', 'titulo', 'fecha_creacion', 'fecha_aprobacion_proyecto']
    });

    return proyectos.map(p => {
      let dias = 0;
      if (p.fecha_aprobacion_proyecto && p.fecha_creacion) {
        const diffTime = Math.abs(p.fecha_aprobacion_proyecto.getTime() - p.fecha_creacion.getTime());
        dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      }
      
      return {
        nombre: p.titulo,
        tiempoPromedio: dias // El frontend espera 'tiempoPromedio'
      };
    });
  }
}
