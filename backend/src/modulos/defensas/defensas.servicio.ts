import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Defensa, EstadoDefensa, TipoDefensa, ResultadoDefensa } from './entidades/defensa.entidad';
import { Tribunal } from './entidades/tribunal.entidad';
import { Proyecto } from '../proyectos/entidades/proyecto.endidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { ProgramarDefensaDto } from './dto/programar-defensa.dto';
import { CalificarDefensaDto } from './dto/calificar-defensa.dto';
import { FinalizarDefensaDto } from './dto/finalizar-defensa.dto';
import { EtapaProyecto } from '../proyectos/enums/etapa-proyecto.enum';

@Injectable()
export class DefensasService {
  constructor(
    @InjectRepository(Defensa)
    private readonly repositorio_defensa: Repository<Defensa>,
    @InjectRepository(Tribunal)
    private readonly repositorio_tribunal: Repository<Tribunal>,
    @InjectRepository(Proyecto)
    private readonly repositorio_proyecto: Repository<Proyecto>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
  ) {}

  async programarDefensa(dto: ProgramarDefensaDto) {
    const proyecto = await this.repositorio_proyecto.findOne({
      where: { id: dto.id_proyecto },
      relations: ['asesor'],
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Validar etapa del proyecto según tipo de defensa
    if (dto.tipo === TipoDefensa.PRE_DEFENSA) {
      if (proyecto.etapa_actual !== EtapaProyecto.SOLICITUD_DEFENSA && 
          proyecto.etapa_actual !== EtapaProyecto.PRE_DEFENSA) {
        throw new BadRequestException('El proyecto debe estar en solicitud de defensa o pre-defensa para programar una pre-defensa');
      }
    } else if (dto.tipo === TipoDefensa.DEFENSA) {
      if (proyecto.etapa_actual !== EtapaProyecto.EN_DEFENSA) {
        throw new BadRequestException('El proyecto debe haber aprobado la pre-defensa para programar la defensa final');
      }
    }

    const asesores = await this.repositorio_asesor.findBy({
      id: In(dto.ids_tribunales),
    });

    if (asesores.length !== dto.ids_tribunales.length) {
      throw new BadRequestException('Uno o más asesores no encontrados');
    }

    // Validar que el asesor del proyecto NO sea parte del tribunal
    if (proyecto.asesor) {
      const asesorDelProyectoEnTribunal = asesores.some(a => a.id === proyecto.asesor.id);
      if (asesorDelProyectoEnTribunal) {
        throw new BadRequestException('El asesor del proyecto no puede ser parte del tribunal');
      }
    }

    // Contar intentos previos para este tipo de defensa
    const intentos_previos = await this.repositorio_defensa.count({
      where: {
        proyecto: { id: dto.id_proyecto },
        tipo: dto.tipo,
      },
    });

    const defensa = this.repositorio_defensa.create({
      proyecto,
      fecha_programada: dto.fecha_programada,
      lugar: dto.lugar,
      enlace: dto.enlace,
      tipo: dto.tipo,
      estado: EstadoDefensa.PROGRAMADA,
      resultado: ResultadoDefensa.PENDIENTE,
      intento_numero: intentos_previos + 1,
    });

    const defensa_guardada = await this.repositorio_defensa.save(defensa);

    const tribunales = asesores.map((asesor) =>
      this.repositorio_tribunal.create({
        defensa: defensa_guardada,
        asesor,
        nota_valida: true,
        ha_calificado: false,
      }),
    );

    await this.repositorio_tribunal.save(tribunales);

    // Actualizar etapa del proyecto
    if (dto.tipo === TipoDefensa.PRE_DEFENSA) {
      proyecto.etapa_actual = EtapaProyecto.PRE_DEFENSA;
    } else {
      proyecto.etapa_actual = EtapaProyecto.EN_DEFENSA;
    }
    await this.repositorio_proyecto.save(proyecto);

    return this.repositorio_defensa.findOne({
      where: { id: defensa_guardada.id },
      relations: ['tribunales', 'tribunales.asesor', 'proyecto'],
    });
  }

  async obtenerDefensasPorTribunal(id_usuario: number) {
    const asesor = await this.repositorio_asesor.findOneBy({ usuario: { id: id_usuario } });
    if (!asesor) {
      throw new ForbiddenException('Usuario no es asesor');
    }

    // Primero, actualizar estados de defensas según fecha/hora
    await this.actualizarEstadosDefensasAutomaticamente();

    const tribunales = await this.repositorio_tribunal.find({
      where: { asesor: { id: asesor.id } },
      relations: ['defensa', 'defensa.proyecto', 'defensa.proyecto.estudiantes', 'defensa.tribunales', 'defensa.tribunales.asesor'],
      order: { defensa: { fecha_programada: 'DESC' } },
    });

    // Transformar a formato de defensas con participación del usuario
    return tribunales.map(tribunal => ({
      ...tribunal.defensa,
      mi_participacion: {
        id: tribunal.id,
        asistencia_confirmada: tribunal.asistencia_confirmada,
        fecha_confirmacion: tribunal.fecha_confirmacion,
        calificacion: tribunal.calificacion,
        nota: tribunal.calificacion,
        observaciones: tribunal.observaciones,
        observaciones_publicas: tribunal.observaciones_publicas,
        comentarios_correccion: tribunal.comentarios_correccion,
        nota_valida: tribunal.nota_valida,
        motivo_invalidacion: tribunal.motivo_invalidacion,
        ha_calificado: tribunal.ha_calificado,
      }
    }));
  }

  // Actualiza automáticamente el estado de las defensas según la fecha/hora
  async actualizarEstadosDefensasAutomaticamente() {
    const ahora = new Date();
    
    // Buscar defensas PROGRAMADAS que ya deberían haber iniciado (fecha_programada <= ahora)
    const defensas_a_iniciar = await this.repositorio_defensa.find({
      where: {
        estado: EstadoDefensa.PROGRAMADA,
      },
    });

    for (const defensa of defensas_a_iniciar) {
      if (defensa.fecha_programada && new Date(defensa.fecha_programada) <= ahora) {
        defensa.estado = EstadoDefensa.EN_CURSO;
        await this.repositorio_defensa.save(defensa);
      }
    }

    // Buscar defensas EN_CURSO que ya deberían haber terminado (fecha_programada + 6 horas <= ahora)
    const defensas_en_curso = await this.repositorio_defensa.find({
      where: {
        estado: EstadoDefensa.EN_CURSO,
      },
    });

    for (const defensa of defensas_en_curso) {
      if (defensa.fecha_programada) {
        const fecha_fin = new Date(defensa.fecha_programada);
        fecha_fin.setHours(fecha_fin.getHours() + 6);
        
        if (ahora >= fecha_fin) {
          defensa.estado = EstadoDefensa.FINALIZADA;
          await this.repositorio_defensa.save(defensa);
        }
      }
    }
  }

  async confirmarAsistencia(id_defensa: number, id_usuario: number) {
    const tribunal = await this.obtenerTribunal(id_defensa, id_usuario);

    // Actualizar estado de la defensa primero
    await this.actualizarEstadosDefensasAutomaticamente();
    
    // Recargar la defensa para obtener el estado actualizado
    const defensa = await this.repositorio_defensa.findOneBy({ id: id_defensa });
    
    if (!defensa) {
      throw new BadRequestException('Defensa no encontrada.');
    }
    
    // Solo se puede confirmar asistencia si la defensa está EN_CURSO
    if (defensa.estado !== EstadoDefensa.EN_CURSO) {
      if (defensa.estado === EstadoDefensa.PROGRAMADA) {
        throw new BadRequestException('La defensa aún no ha iniciado. Podrá confirmar asistencia una vez que inicie.');
      }
      if (defensa.estado === EstadoDefensa.FINALIZADA) {
        throw new BadRequestException('La defensa ya ha finalizado. No puede confirmar asistencia.');
      }
      throw new BadRequestException('No puede confirmar asistencia en este momento.');
    }

    tribunal.asistencia_confirmada = true;
    tribunal.fecha_confirmacion = new Date();
    return this.repositorio_tribunal.save(tribunal);
  }

  async calificarDefensa(id_defensa: number, id_usuario: number, dto: CalificarDefensaDto) {
    const tribunal = await this.obtenerTribunal(id_defensa, id_usuario);

    if (!tribunal.asistencia_confirmada) {
      throw new BadRequestException('Debe confirmar su asistencia antes de calificar.');
    }

    // Verificar que la defensa haya iniciado
    if (tribunal.defensa.estado !== EstadoDefensa.EN_CURSO && 
        tribunal.defensa.estado !== EstadoDefensa.FINALIZADA) {
      throw new BadRequestException('Solo puede calificar una vez la defensa haya iniciado.');
    }

    tribunal.calificacion = dto.calificacion;
    tribunal.ha_calificado = true;
    if (dto.observaciones) {
      tribunal.observaciones = dto.observaciones;
    }
    // Solo guardar observaciones públicas para pre-defensa
    if (dto.observaciones_publicas && tribunal.defensa.tipo === TipoDefensa.PRE_DEFENSA) {
      tribunal.observaciones_publicas = dto.observaciones_publicas;
    }
    return this.repositorio_tribunal.save(tribunal);
  }

  async agregarComentariosCorreccion(id_defensa: number, id_usuario: number, comentarios: string) {
    const tribunal = await this.obtenerTribunal(id_defensa, id_usuario);
    tribunal.comentarios_correccion = comentarios;
    return this.repositorio_tribunal.save(tribunal);
  }

  async iniciarDefensa(id_defensa: number) {
    const defensa = await this.repositorio_defensa.findOneBy({ id: id_defensa });
    if (!defensa) throw new NotFoundException('Defensa no encontrada');
    
    if (defensa.estado !== EstadoDefensa.PROGRAMADA) {
      throw new BadRequestException('La defensa ya ha sido iniciada o finalizada');
    }

    defensa.estado = EstadoDefensa.EN_CURSO;
    return this.repositorio_defensa.save(defensa);
  }

  async finalizarDefensa(id_defensa: number, dto: FinalizarDefensaDto) {
    const defensa = await this.repositorio_defensa.findOne({
      where: { id: id_defensa },
      relations: ['tribunales', 'proyecto'],
    });

    if (!defensa) throw new NotFoundException('Defensa no encontrada');

    // Invalidar notas si se especifica
    if (dto.ids_notas_invalidas && dto.ids_notas_invalidas.length > 0) {
      for (const tribunal of defensa.tribunales) {
        if (dto.ids_notas_invalidas.includes(tribunal.id)) {
          tribunal.nota_valida = false;
          tribunal.motivo_invalidacion = dto.motivo_invalidacion || 'Nota invalidada por administrador';
          await this.repositorio_tribunal.save(tribunal);
        }
      }
    }

    // Calcular nota promedio (solo notas válidas de tribunales que han calificado)
    const notas_validas = defensa.tribunales.filter(t => 
      t.ha_calificado && t.nota_valida && t.calificacion !== null
    );

    // Si no hay notas válidas, la defensa se reprueba por inasistencia
    let nota_promedio = 0;
    let aprobado = false;
    let reprobado_por_inasistencia = false;

    if (notas_validas.length === 0) {
      // No hay notas, reprobado por inasistencia
      reprobado_por_inasistencia = true;
      defensa.observaciones_generales = (defensa.observaciones_generales || '') + 
        '\n[REPROBADO POR INASISTENCIA - No se registraron calificaciones del tribunal]';
    } else {
      const suma_notas = notas_validas.reduce((sum, t) => sum + t.calificacion, 0);
      nota_promedio = suma_notas / notas_validas.length;
      aprobado = nota_promedio >= defensa.nota_minima_aprobacion;
    }

    defensa.nota_promedio = nota_promedio;
    defensa.comentarios_admin = dto.comentarios_admin || '';
    defensa.estado = EstadoDefensa.FINALIZADA;

    // Determinar resultado
    defensa.resultado = (aprobado && !reprobado_por_inasistencia) ? ResultadoDefensa.APROBADO : ResultadoDefensa.REPROBADO;

    await this.repositorio_defensa.save(defensa);

    // Actualizar etapa del proyecto según resultado
    const proyecto = defensa.proyecto;
    const defensa_aprobada = aprobado && !reprobado_por_inasistencia;
    
    if (defensa.tipo === TipoDefensa.PRE_DEFENSA) {
      if (defensa_aprobada) {
        proyecto.etapa_actual = EtapaProyecto.EN_DEFENSA;
        await this.repositorio_proyecto.save(proyecto);
        
        // Crear automáticamente la defensa final (sin programar)
        const nueva_defensa = this.repositorio_defensa.create({
          proyecto: proyecto,
          tipo: TipoDefensa.DEFENSA,
          estado: EstadoDefensa.PROGRAMADA, // Se usará PROGRAMADA pero sin fecha hasta que admin la programe
          resultado: ResultadoDefensa.PENDIENTE,
          nota_minima_aprobacion: 51,
          intento_numero: 1,
          observaciones_generales: 'Defensa creada automáticamente tras aprobar pre-defensa. Pendiente de programar fecha.',
        });
        await this.repositorio_defensa.save(nueva_defensa);
      } else {
        // Reprobó pre-defensa, puede reprogramar
        proyecto.etapa_actual = EtapaProyecto.PRE_DEFENSA;
        await this.repositorio_proyecto.save(proyecto);
      }
    } else {
      // Defensa final
      if (defensa_aprobada) {
        proyecto.etapa_actual = EtapaProyecto.TERMINADO;
        await this.repositorio_proyecto.save(proyecto);
      } else {
        // Verificar si es segundo intento
        const intentos_defensa = await this.repositorio_defensa.count({
          where: {
            proyecto: { id: proyecto.id },
            tipo: TipoDefensa.DEFENSA,
            resultado: ResultadoDefensa.REPROBADO,
          },
        });

        if (intentos_defensa >= 2) {
          // Reprobó 2 veces, debe reinscribirse a Taller de Grado I
          proyecto.etapa_actual = EtapaProyecto.REPROBADO;
        } else {
          // Puede reprogramar
          proyecto.etapa_actual = EtapaProyecto.EN_DEFENSA;
        }
        await this.repositorio_proyecto.save(proyecto);
      }
    }

    return this.repositorio_defensa.findOne({
      where: { id: id_defensa },
      relations: ['tribunales', 'tribunales.asesor', 'proyecto'],
    });
  }

  async rehabilitarDefensa(id_proyecto: number) {
    const proyecto = await this.repositorio_proyecto.findOneBy({ id: id_proyecto });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    // Verificar última defensa reprobada
    const ultima_defensa = await this.repositorio_defensa.findOne({
      where: { proyecto: { id: id_proyecto } },
      order: { fecha_creacion: 'DESC' },
    });

    if (!ultima_defensa || ultima_defensa.resultado !== ResultadoDefensa.REPROBADO) {
      throw new BadRequestException('No hay una defensa reprobada para rehabilitar');
    }

    // Verificar límite de intentos para defensa final
    if (ultima_defensa.tipo === TipoDefensa.DEFENSA) {
      const intentos = await this.repositorio_defensa.count({
        where: {
          proyecto: { id: id_proyecto },
          tipo: TipoDefensa.DEFENSA,
        },
      });

      if (intentos >= 2) {
        throw new BadRequestException('Se ha alcanzado el límite de intentos para la defensa final. El estudiante debe reinscribirse a Taller de Grado I.');
      }
    }

    return { 
      mensaje: 'Proyecto habilitado para nueva programación de defensa', 
      proyecto,
      tipo_a_reprogramar: ultima_defensa.tipo,
      intento_actual: ultima_defensa.intento_numero 
    };
  }

  async reprogramarDefensa(id_proyecto: number, dto: ProgramarDefensaDto) {
    const proyecto = await this.repositorio_proyecto.findOne({
      where: { id: id_proyecto },
      relations: ['asesor'],
    });

    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    // Verificar última defensa reprobada
    const ultima_defensa = await this.repositorio_defensa.findOne({
      where: { proyecto: { id: id_proyecto } },
      order: { fecha_creacion: 'DESC' },
      relations: ['tribunales'],
    });

    if (!ultima_defensa || ultima_defensa.resultado !== ResultadoDefensa.REPROBADO) {
      throw new BadRequestException('No hay una defensa reprobada para reprogramar');
    }

    // Usar el mismo tipo de defensa
    const tipo = ultima_defensa.tipo;

    // Verificar límite de intentos
    if (tipo === TipoDefensa.DEFENSA) {
      const intentos = await this.repositorio_defensa.count({
        where: {
          proyecto: { id: id_proyecto },
          tipo: TipoDefensa.DEFENSA,
        },
      });

      if (intentos >= 2) {
        throw new BadRequestException('Se ha alcanzado el límite de intentos para la defensa final.');
      }
    }

    // Programar la nueva defensa
    return this.programarDefensa({
      ...dto,
      id_proyecto,
      tipo,
    });
  }

  async obtenerProyectosParaReprogramar() {
    // Obtener proyectos con la última defensa reprobada
    const proyectos = await this.repositorio_proyecto.find({
      where: [
        { etapa_actual: EtapaProyecto.PRE_DEFENSA },
        { etapa_actual: EtapaProyecto.EN_DEFENSA },
      ],
      relations: ['estudiantes', 'asesor'],
    });

    const resultado: {
      proyecto: Proyecto;
      ultima_defensa: Defensa;
      tipo_a_reprogramar: TipoDefensa;
      intento_siguiente: number;
    }[] = [];
    
    for (const proyecto of proyectos) {
      const ultima_defensa = await this.repositorio_defensa.findOne({
        where: { proyecto: { id: proyecto.id } },
        order: { fecha_creacion: 'DESC' },
        relations: ['tribunales', 'tribunales.asesor'],
      });

      if (ultima_defensa?.resultado === ResultadoDefensa.REPROBADO) {
        // Verificar que no haya alcanzado el límite
        if (ultima_defensa.tipo === TipoDefensa.DEFENSA) {
          const intentos = await this.repositorio_defensa.count({
            where: {
              proyecto: { id: proyecto.id },
              tipo: TipoDefensa.DEFENSA,
            },
          });
          if (intentos >= 2) continue;
        }

        resultado.push({
          proyecto,
          ultima_defensa,
          tipo_a_reprogramar: ultima_defensa.tipo,
          intento_siguiente: ultima_defensa.intento_numero + 1,
        });
      }
    }

    return resultado;
  }

  async obtenerObservacionesPreDefensaParaEstudiante(id_proyecto: number) {
    // Obtener todas las pre-defensas del proyecto
    const predefensas = await this.repositorio_defensa.find({
      where: {
        proyecto: { id: id_proyecto },
        tipo: TipoDefensa.PRE_DEFENSA,
      },
      relations: ['tribunales', 'tribunales.asesor'],
      order: { fecha_creacion: 'DESC' },
    });

    // Filtrar solo observaciones públicas
    return predefensas.map(defensa => ({
      id: defensa.id,
      fecha_programada: defensa.fecha_programada,
      resultado: defensa.resultado,
      nota_promedio: defensa.nota_promedio,
      intento_numero: defensa.intento_numero,
      observaciones: defensa.tribunales
        .filter(t => t.observaciones_publicas)
        .map(t => ({
          asesor: `${t.asesor.nombre} ${t.asesor.apellido}`,
          observacion: t.observaciones_publicas,
        })),
    }));
  }

  async obtenerDefensasPorProyecto(id_proyecto: number) {
    return this.repositorio_defensa.find({
      where: { proyecto: { id: id_proyecto } },
      relations: ['tribunales', 'tribunales.asesor'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async obtenerDefensaDetalle(id_defensa: number) {
    const defensa = await this.repositorio_defensa.findOne({
      where: { id: id_defensa },
      relations: ['tribunales', 'tribunales.asesor', 'proyecto', 'proyecto.estudiantes', 'proyecto.asesor'],
    });

    if (!defensa) throw new NotFoundException('Defensa no encontrada');
    return defensa;
  }

  async obtenerSolicitudesPendientes() {
    return this.repositorio_proyecto.find({
      where: { etapa_actual: EtapaProyecto.SOLICITUD_DEFENSA },
      relations: ['estudiantes', 'asesor'],
    });
  }

  async obtenerDefensasProgramadas(tipo?: TipoDefensa) {
    const where: any = {
      estado: In([EstadoDefensa.PROGRAMADA, EstadoDefensa.EN_CURSO]),
    };
    
    if (tipo) {
      where.tipo = tipo;
    }

    return this.repositorio_defensa.find({
      where,
      relations: ['tribunales', 'tribunales.asesor', 'proyecto', 'proyecto.estudiantes', 'proyecto.asesor'],
      order: { fecha_programada: 'ASC' },
    });
  }

  async obtenerDefensasFinalizadas(tipo?: TipoDefensa) {
    const where: any = {
      estado: EstadoDefensa.FINALIZADA,
    };
    
    if (tipo) {
      where.tipo = tipo;
    }

    return this.repositorio_defensa.find({
      where,
      relations: ['tribunales', 'tribunales.asesor', 'proyecto', 'proyecto.estudiantes', 'proyecto.asesor'],
      order: { fecha_programada: 'DESC' },
    });
  }

  async obtenerTodasPorTipo(tipo: TipoDefensa) {
    return this.repositorio_defensa.find({
      where: { tipo },
      relations: ['tribunales', 'tribunales.asesor', 'proyecto', 'proyecto.estudiantes', 'proyecto.asesor'],
      order: { fecha_programada: 'DESC' },
    });
  }

  async validarTribunalParaProyecto(id_proyecto: number, ids_asesores: number[]) {
    const proyecto = await this.repositorio_proyecto.findOne({
      where: { id: id_proyecto },
      relations: ['asesor'],
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const asesores = await this.repositorio_asesor.findBy({
      id: In(ids_asesores),
    });

    const errores: string[] = [];

    // Verificar que el asesor del proyecto no esté en el tribunal
    if (proyecto.asesor) {
      const asesorEnTribunal = asesores.find(a => a.id === proyecto.asesor.id);
      if (asesorEnTribunal) {
        errores.push(`El asesor del proyecto (${proyecto.asesor.nombre} ${proyecto.asesor.apellido}) no puede ser parte del tribunal`);
      }
    }

    return {
      valido: errores.length === 0,
      errores,
      asesores_disponibles: asesores.filter(a => a.id !== proyecto.asesor?.id),
    };
  }

  async asignarFechaDefensa(id_defensa: number, dto: ProgramarDefensaDto) {
    const defensa = await this.repositorio_defensa.findOne({
      where: { id: id_defensa },
      relations: ['proyecto', 'proyecto.asesor', 'tribunales'],
    });

    if (!defensa) {
      throw new NotFoundException('Defensa no encontrada');
    }

    if (defensa.fecha_programada && defensa.tribunales?.length > 0) {
      throw new BadRequestException('Esta defensa ya está programada. Use reprogramar si necesita cambiar la fecha.');
    }

    // Validar asesores para tribunal
    const asesores = await this.repositorio_asesor.findBy({
      id: In(dto.ids_tribunales),
    });

    if (asesores.length !== dto.ids_tribunales.length) {
      throw new BadRequestException('Uno o más asesores no encontrados');
    }

    // Validar que el asesor del proyecto NO sea parte del tribunal
    if (defensa.proyecto.asesor) {
      const asesorDelProyectoEnTribunal = asesores.some(a => a.id === defensa.proyecto.asesor.id);
      if (asesorDelProyectoEnTribunal) {
        throw new BadRequestException('El asesor del proyecto no puede ser parte del tribunal');
      }
    }

    // Actualizar la defensa con fecha y lugar
    defensa.fecha_programada = new Date(dto.fecha_programada);
    defensa.lugar = dto.lugar || '';
    defensa.enlace = dto.enlace || '';
    defensa.observaciones_generales = '';

    await this.repositorio_defensa.save(defensa);

    // Eliminar tribunales anteriores si los hay
    if (defensa.tribunales?.length > 0) {
      await this.repositorio_tribunal.remove(defensa.tribunales);
    }

    // Crear nuevos tribunales
    const tribunales = asesores.map((asesor) =>
      this.repositorio_tribunal.create({
        defensa: defensa,
        asesor,
        nota_valida: true,
        ha_calificado: false,
      }),
    );

    await this.repositorio_tribunal.save(tribunales);

    return this.repositorio_defensa.findOne({
      where: { id: id_defensa },
      relations: ['tribunales', 'tribunales.asesor', 'proyecto'],
    });
  }

  private async obtenerTribunal(id_defensa: number, id_usuario: number) {
    const asesor = await this.repositorio_asesor.findOneBy({ usuario: { id: id_usuario } });
    if (!asesor) {
      throw new ForbiddenException('Usuario no es asesor');
    }

    const tribunal = await this.repositorio_tribunal.findOne({
      where: { defensa: { id: id_defensa }, asesor: { id: asesor.id } },
      relations: ['defensa', 'defensa.proyecto'],
    });

    if (!tribunal) {
      throw new ForbiddenException('No está asignado como tribunal para esta defensa.');
    }

    return tribunal;
  }
}
