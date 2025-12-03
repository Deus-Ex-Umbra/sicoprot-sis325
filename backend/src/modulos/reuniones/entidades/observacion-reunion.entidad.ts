import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reunion } from './reunion.entidad';

export enum EstadoObservacionReunion {
  PENDIENTE = 'pendiente',
  CORREGIDA = 'corregida',
}

@Entity('observaciones_reunion')
export class ObservacionReunion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: EstadoObservacionReunion,
    default: EstadoObservacionReunion.PENDIENTE,
  })
  estado: EstadoObservacionReunion;

  @ManyToOne(() => Reunion, (reunion) => reunion.observaciones)
  reunion: Reunion;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;
}
