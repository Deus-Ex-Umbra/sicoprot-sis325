import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Periodo } from './entidades/periodo.entidad';
import { CrearPeriodoDto } from './dto/crear-periodo.dto';
import { ActualizarPeriodoDto } from './dto/actualizar-periodo.dto';

@Injectable()
export class PeriodosService {
  constructor(
    @InjectRepository(Periodo)
    private readonly repositorio_periodo: Repository<Periodo>,
  ) {}

  async crear(crear_periodo_dto: CrearPeriodoDto) {
    if (crear_periodo_dto.activo) {
      await this.repositorio_periodo.update({ activo: true }, { activo: false });
    }

    const nuevo_periodo = this.repositorio_periodo.create(crear_periodo_dto);
    return this.repositorio_periodo.save(nuevo_periodo);
  }

  async obtenerTodos() {
    return this.repositorio_periodo.find({
      relations: ['grupos'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async obtenerUno(id: number) {
    const periodo = await this.repositorio_periodo.findOne({
      where: { id },
      relations: ['grupos', 'grupos.asesor', 'grupos.estudiantes'],
    });

    if (!periodo) {
      throw new NotFoundException(`Período con ID '${id}' no encontrado.`);
    }

    return periodo;
  }

  async obtenerActivo() {
    const periodo = await this.repositorio_periodo.findOne({
      where: { activo: true },
      relations: ['grupos'],
    });

    if (!periodo) {
      throw new NotFoundException('No hay un período activo.');
    }

    return periodo;
  }

  async actualizar(id: number, actualizar_periodo_dto: ActualizarPeriodoDto) {
    const periodo = await this.repositorio_periodo.findOneBy({ id });

    if (!periodo) {
      throw new NotFoundException(`Período con ID '${id}' no encontrado.`);
    }

    if (actualizar_periodo_dto.activo === true && !periodo.activo) {
      await this.repositorio_periodo.update({ activo: true }, { activo: false });
    }

    Object.assign(periodo, actualizar_periodo_dto);
    return this.repositorio_periodo.save(periodo);
  }

  async eliminar(id: number) {
    const periodo = await this.repositorio_periodo.findOne({
      where: { id },
      relations: ['grupos'],
    });

    if (!periodo) {
      throw new NotFoundException(`Período con ID '${id}' no encontrado.`);
    }

    if (periodo.grupos && periodo.grupos.length > 0) {
      throw new BadRequestException('No se puede eliminar un período que tiene grupos asociados.');
    }

    await this.repositorio_periodo.remove(periodo);
    return { message: `Período con ID '${id}' eliminado exitosamente.` };
  }
}