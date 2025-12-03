import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Proyecto } from '../../proyectos/entidades/proyecto.endidad';
import { Tribunal } from './tribunal.entidad';

export enum TipoDefensa {
  PRE_DEFENSA = 'pre_defensa',
  DEFENSA = 'defensa',
}

export enum EstadoDefensa {
  PROGRAMADA = 'programada',
  EN_CURSO = 'en_curso',
  FINALIZADA = 'finalizada',
  APROBADA = 'aprobada',
  REPROBADA = 'reprobada',
  CANCELADA = 'cancelada',
}

export enum ResultadoDefensa {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  REPROBADO = 'reprobado',
}

@Entity('defensas')
export class Defensa {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Proyecto, { eager: true })
  proyecto: Proyecto;

  @Column({ type: 'timestamp', nullable: true })
  fecha_programada: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lugar: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  enlace: string;

  @Column({
    type: 'enum',
    enum: TipoDefensa,
    default: TipoDefensa.PRE_DEFENSA,
  })
  tipo: TipoDefensa;

  @Column({
    type: 'enum',
    enum: EstadoDefensa,
    default: EstadoDefensa.PROGRAMADA,
  })
  estado: EstadoDefensa;

  @Column({
    type: 'enum',
    enum: ResultadoDefensa,
    default: ResultadoDefensa.PENDIENTE,
  })
  resultado: ResultadoDefensa;

  @Column({ type: 'float', nullable: true })
  nota_promedio: number;

  @Column({ type: 'float', default: 51 })
  nota_minima_aprobacion: number;

  @Column({ type: 'int', default: 0 })
  intento_numero: number;

  @Column({ type: 'text', nullable: true })
  observaciones_generales: string;

  @Column({ type: 'text', nullable: true })
  comentarios_admin: string;

  @OneToMany(() => Tribunal, (tribunal) => tribunal.defensa, { cascade: true })
  tribunales: Tribunal[];

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;
}
