import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Defensa } from './defensa.entidad';
import { Asesor } from '../../asesores/entidades/asesor.entidad';

@Entity('tribunales')
export class Tribunal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Defensa, (defensa) => defensa.tribunales)
  defensa: Defensa;

  @ManyToOne(() => Asesor, { eager: true })
  asesor: Asesor;

  @Column({ type: 'boolean', default: false })
  asistencia_confirmada: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fecha_confirmacion: Date;

  @Column({ type: 'float', nullable: true })
  calificacion: number;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ type: 'text', nullable: true })
  observaciones_publicas?: string; // Observaciones visibles para el estudiante en pre-defensa

  @Column({ type: 'text', nullable: true })
  comentarios_correccion?: string;

  @Column({ type: 'boolean', default: true })
  nota_valida: boolean;

  @Column({ type: 'text', nullable: true })
  motivo_invalidacion?: string;

  @Column({ type: 'boolean', default: false })
  ha_calificado: boolean;

  @CreateDateColumn({ name: 'fecha_asignacion' })
  fecha_asignacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;
}
