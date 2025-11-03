import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Proyecto } from '../../proyectos/entidades/proyecto.endidad';
import { Asesor } from '../../asesores/entidades/asesor.entidad';

export enum EstadoReunion {
  PROGRAMADA = 'programada',
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

  @Column({ type: 'timestamp' })
  fecha_programada: Date;

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

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.reuniones)
  @JoinColumn({ name: 'id_proyecto' })
  proyecto: Proyecto;

  @ManyToOne(() => Asesor, (asesor) => asesor.reuniones_agendadas)
  @JoinColumn({ name: 'id_asesor' })
  asesor: Asesor;
}