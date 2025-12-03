import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Proyecto } from '../../proyectos/entidades/proyecto.endidad';
import { Asesor } from '../../asesores/entidades/asesor.entidad';
import { ObservacionReunion } from './observacion-reunion.entidad';

export enum EstadoReunion {
  SOLICITADA = 'solicitada', // Propuesta por docente
  PENDIENTE_CONFIRMACION = 'pendiente_confirmacion', // Fecha puesta por estudiante
  PROGRAMADA = 'programada', // Confirmada por docente
  REALIZADA = 'realizada',
  CANCELADA = 'cancelada',
}

@Entity('reuniones')
export class Reunion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion?: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_programada: Date;

  @Column({ type: 'timestamp', nullable: true })
  rango_fecha_inicio?: Date;

  @Column({ type: 'timestamp', nullable: true })
  rango_fecha_fin?: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_realizada?: Date;

  @Column({
    type: 'enum',
    enum: EstadoReunion,
    default: EstadoReunion.PROGRAMADA,
  })
  estado: EstadoReunion;

  @Column({ type: 'text', nullable: true })
  notas_reunion_html?: string;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.reuniones)
  proyecto: Proyecto;

  @ManyToOne(() => Asesor, (asesor) => asesor.reuniones_agendadas)
  asesor: Asesor;

  @OneToMany(() => ObservacionReunion, (obs) => obs.reunion)
  observaciones: ObservacionReunion[];

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;
}