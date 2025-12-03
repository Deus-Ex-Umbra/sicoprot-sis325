import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, In } from 'typeorm';
import { Usuario } from '../usuarios/entidades/usuario.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../asesores/entidades/asesor.entidad';
import { EstadoUsuario } from '../usuarios/enums/estado-usuario.enum';
import { Rol } from '../usuarios/enums/rol.enum';
import { Grupo } from '../grupos/entidades/grupo.entidad';
import { Periodo } from '../periodos/entidades/periodo.entidad';
import { SolicitudRegistro } from '../solicitudes-registro/entidades/solicitud-registro.entidad';
import { EstadoSolicitud } from '../solicitudes-registro/entidades/solicitud-registro.entidad';
import { EstadoObservacion } from '../observaciones/enums/estado-observacion.enum';

@Injectable()
export class AdministracionService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repositorio_usuario: Repository<Usuario>,
    @InjectRepository(Estudiante)
    private readonly repositorio_estudiante: Repository<Estudiante>,
    @InjectRepository(Asesor)
    private readonly repositorio_asesor: Repository<Asesor>,
    @InjectRepository(Grupo)
    private readonly repositorio_grupo: Repository<Grupo>,
    @InjectRepository(Periodo)
    private readonly repositorio_periodo: Repository<Periodo>,
    @InjectRepository(SolicitudRegistro)
    private readonly repositorio_solicitud: Repository<SolicitudRegistro>,
  ) {}

  async obtenerTodosUsuarios() {
    const usuarios = await this.repositorio_usuario.find({
      order: { creado_en: 'DESC' },
    });

    const usuarios_completos = await Promise.all(
      usuarios.map(async (usuario) => {
        let perfil: any = null;

        if (usuario.rol === Rol.Estudiante) {
          const estudiante = await this.repositorio_estudiante.findOne({
            where: { usuario: { id: usuario.id } },
            relations: ['grupos', 'grupos.periodo', 'proyecto'],
          });
          if (estudiante) {
            const grupo_activo = estudiante.grupos?.find(g => g.periodo.activo);
            perfil = {
              id_estudiante: estudiante.id,
              nombre: estudiante.nombre,
              apellido: estudiante.apellido,
              grupo: grupo_activo,
              proyecto: estudiante.proyecto,
            };
          }
        } else if (usuario.rol === Rol.Asesor) {
          const asesor = await this.repositorio_asesor.findOne({
            where: { usuario: { id: usuario.id } },
            relations: ['grupos'],
          });
          if (asesor) {
            perfil = {
              id_asesor: asesor.id,
              nombre: asesor.nombre,
              apellido: asesor.apellido,
              grupos: asesor.grupos,
            };
          }
        }

        return {
          ...usuario,
          perfil,
        };
      }),
    );

    return usuarios_completos;
  }

  async obtenerEstudiantes() {
    return this.repositorio_estudiante.find({
      relations: ['usuario', 'grupos', 'grupos.asesor', 'grupos.periodo', 'proyecto'],
    });
  }

  async obtenerEstudiantesSinGrupo() {
    const periodo_activo = await this.repositorio_periodo.findOne({ where: { activo: true } });
    
    if (!periodo_activo) {
      return this.repositorio_estudiante.find({ relations: ['usuario', 'proyecto'] });
    }

    const estudiantes_con_grupo_activo = await this.repositorio_estudiante
      .createQueryBuilder('estudiante')
      .innerJoin('estudiante.grupos', 'grupo')
      .where('grupo.periodoId = :periodoId', { periodoId: periodo_activo.id })
      .getMany();
    
    const ids_con_grupo = estudiantes_con_grupo_activo.map(e => e.id);

    if (ids_con_grupo.length === 0) {
      return this.repositorio_estudiante.find({ relations: ['usuario', 'proyecto'] });
    }

    return this.repositorio_estudiante.find({
      where: {
        id: Not(In(ids_con_grupo))
      },
      relations: ['usuario', 'proyecto']
    });
  }

  async cambiarEstadoUsuario(id_usuario: number, nuevo_estado: EstadoUsuario) {
    const usuario = await this.repositorio_usuario.findOneBy({ id: id_usuario });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID '${id_usuario}' no encontrado.`);
    }

    if (usuario.rol === Rol.Administrador) {
      throw new BadRequestException('No se puede cambiar el estado de un administrador.');
    }

    usuario.estado = nuevo_estado;
    return this.repositorio_usuario.save(usuario);
  }

  async obtenerReporteAvance(grupo_id?: number, asesor_id?: number) {
    const query = this.repositorio_estudiante.createQueryBuilder('estudiante')
      .leftJoinAndSelect('estudiante.proyecto', 'proyecto')
      .leftJoinAndSelect('proyecto.documentos', 'documentos')
      .leftJoinAndSelect('documentos.observaciones', 'observaciones')
      .leftJoinAndSelect('estudiante.grupos', 'grupos')
      .leftJoinAndSelect('proyecto.asesor', 'asesor');

    if (grupo_id) {
      query.andWhere('grupos.id = :grupo_id', { grupo_id });
    }

    if (asesor_id) {
      query.andWhere('asesor.id = :asesor_id', { asesor_id });
    }

    const estudiantes = await query.getMany();

    return estudiantes.map((estudiante) => {
      const proyecto = estudiante.proyecto;
      if (!proyecto) {
        return {
          estudiante: `${estudiante.nombre} ${estudiante.apellido}`,
          proyecto: 'Sin proyecto',
          etapa: 'N/A',
          total_documentos: 0,
          total_observaciones: 0,
          observaciones_resueltas: 0,
          observaciones_pendientes: 0,
          tiempo_promedio_revision_dias: 0,
          dias_sin_actividad: 0,
          estado_avance: 'Sin iniciar',
        };
      }

      let total_observaciones = 0;
      let observaciones_resueltas = 0;
      let observaciones_pendientes = 0;
      let suma_tiempos_revision = 0;
      let documentos_con_revision = 0;
      let ultima_actividad = proyecto.fecha_creacion ? new Date(proyecto.fecha_creacion).getTime() : 0;

      if (proyecto.documentos) {
        proyecto.documentos.forEach((doc) => {
          const fecha_doc = new Date(doc.fecha_subida).getTime();
          if (fecha_doc > ultima_actividad) {
            ultima_actividad = fecha_doc;
          }

          if (doc.observaciones && doc.observaciones.length > 0) {
            const fechas_observaciones = doc.observaciones.map((obs) =>
              new Date(obs.fecha_creacion).getTime(),
            );
            const primera_observacion = Math.min(...fechas_observaciones);
            const fecha_subida = new Date(doc.fecha_subida).getTime();

            const tiempo_revision = primera_observacion - fecha_subida;
            if (tiempo_revision > 0) {
              suma_tiempos_revision += tiempo_revision;
              documentos_con_revision++;
            }

            total_observaciones += doc.observaciones.length;
            observaciones_resueltas += doc.observaciones.filter(
              (o) => o.estado === EstadoObservacion.CORREGIDA,
            ).length;
            observaciones_pendientes += doc.observaciones.filter(
              (o) => o.estado === EstadoObservacion.PENDIENTE,
            ).length;
          }
        });
      }

      const tiempo_promedio =
        documentos_con_revision > 0
          ? suma_tiempos_revision / documentos_con_revision / (1000 * 60 * 60 * 24)
          : 0;

      const dias_sin_actividad = Math.floor(
        (Date.now() - ultima_actividad) / (1000 * 60 * 60 * 24),
      );

      let estado_avance = 'Activo';
      if (dias_sin_actividad > 90) {
        estado_avance = 'Posible Abandono';
      } else if (dias_sin_actividad > 30) {
        estado_avance = 'Inactivo Reciente';
      }

      return {
        estudiante: `${estudiante.nombre} ${estudiante.apellido}`,
        proyecto: proyecto.titulo,
        etapa: proyecto.etapa_actual,
        total_documentos: proyecto.documentos ? proyecto.documentos.length : 0,
        total_observaciones,
        observaciones_resueltas,
        observaciones_pendientes,
        tiempo_promedio_revision_dias: parseFloat(tiempo_promedio.toFixed(2)),
        dias_sin_actividad,
        estado_avance,
      };
    });
  }

  async obtenerEstadisticas() {
    const total_usuarios = await this.repositorio_usuario.count();
    const usuarios_activos = await this.repositorio_usuario.count({
      where: { estado: EstadoUsuario.Activo },
    });
    
    const total_estudiantes = await this.repositorio_estudiante.count();
    const total_asesores = await this.repositorio_asesor.count();
    const estudiantes_sin_grupo = await this.obtenerEstudiantesSinGrupo();
    const total_grupos = await this.repositorio_grupo.count();
    const grupos_activos = await this.repositorio_grupo.count({
      where: { activo: true },
    });

    const periodo_activo = await this.repositorio_periodo.findOne({
      where: { activo: true },
    });

    let grupos_periodo_actual = 0;
    if (periodo_activo) {
      grupos_periodo_actual = await this.repositorio_grupo.count({
        where: { periodo: { id: periodo_activo.id }, activo: true },
      });
    }

    const solicitudes_pendientes = await this.repositorio_solicitud.count({
      where: { estado: EstadoSolicitud.Pendiente },
    });
    
    const usuarios_pendientes = await this.repositorio_usuario.count({
      where: { estado: EstadoUsuario.Pendiente },
    });

    return {
      total_usuarios,
      usuarios_activos,
      usuarios_pendientes,
      total_estudiantes,
      total_asesores,
      estudiantes_sin_grupo: estudiantes_sin_grupo.length,
      total_grupos,
      grupos_activos,
      grupos_periodo_actual,
      solicitudes_pendientes,
    };
  }
}