import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Observacion } from '../../observaciones/entidades/observacion.entidad';
import { Estudiante } from '../../estudiantes/entidades/estudiante.entidad';
import { Documento } from '../../documentos/entidades/documento.entidad';
import { EstadoCorreccion } from '../enums/estado-correccion.enum';

@Entity('correcciones')
export class Correccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  titulo?: string;

  @Column('text')
  descripcion_html: string;

  @Column({ type: 'int' })
  version_corregida: number;

  @Column({ type: 'float', nullable: true })
  x_inicio?: number;

  @Column({ type: 'float', nullable: true })
  y_inicio?: number;

  @Column({ type: 'float', nullable: true })
  x_fin?: number;

  @Column({ type: 'float', nullable: true })
  y_fin?: number;

  @Column({ type: 'int', nullable: true })
  pagina_inicio?: number;

  @Column({ type: 'int', nullable: true })
  pagina_fin?: number;

  @Column({ type: 'varchar', length: 7, default: '#28a745' })
  color: string;

  @Column({
    type: 'enum',
    enum: EstadoCorreccion,
    default: EstadoCorreccion.PENDIENTE_REVISION,
  })
  estado: EstadoCorreccion;

  @Column({
    type: 'enum',
    enum: ['PENDIENTE', 'APROBADA', 'RECHAZADA'],
    default: 'PENDIENTE',
    nullable: true,
  })
  estado_verificacion?: string;

  @Column({ type: 'text', nullable: true })
  comentario_verificacion_html?: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_verificacion?: Date;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;

  @ManyToOne(() => Observacion, (observacion) => observacion.correcciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'observacion_id' })
  observacion: Observacion;

  @ManyToOne(() => Estudiante, (estudiante) => estudiante.correcciones, {
    eager: true,
  })
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @ManyToOne(() => Documento, { nullable: true })
  @JoinColumn({ name: 'documento_id' })
  documento?: Documento;
}