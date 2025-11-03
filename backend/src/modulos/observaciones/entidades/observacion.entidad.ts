import {
  Index,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Documento } from '../../documentos/entidades/documento.entidad';
import { Asesor } from '../../asesores/entidades/asesor.entidad';
import { EstadoObservacion } from '../enums/estado-observacion.enum';
import { Correccion } from '../../correcciones/entidades/correccion.entidad';
import { EtapaProyecto } from '../../proyectos/enums/etapa-proyecto.enum';

@Entity('observaciones')
@Index(['documento', 'version_observada'])
@Index(['estado'])
export class Observacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column('text')
  contenido_html: string;

  @Column({
    type: 'enum',
    enum: EstadoObservacion,
    default: EstadoObservacion.PENDIENTE,
  })
  estado: EstadoObservacion;

  @Column({ nullable: true, type: 'text' })
  comentarios_asesor_html?: string;

  @Column({ type: 'float' })
  x_inicio: number;

  @Column({ type: 'float' })
  y_inicio: number;

  @Column({ type: 'float' })
  x_fin: number;

  @Column({ type: 'float' })
  y_fin: number;

  @Column({ type: 'int' })
  pagina_inicio: number;

  @Column({ type: 'int' })
  pagina_fin: number;

  @Column({ type: 'boolean', default: false })
  archivada: boolean;

  @Column({ name: 'version_observada', type: 'int', nullable: true })
  version_observada?: number;

  @Column({ name: 'version_corregida', type: 'int', nullable: true })
  version_corregida?: number;

  @Column({ name: 'fecha_verificacion', type: 'timestamp', nullable: true })
  fecha_verificacion?: Date;

  @Column({ name: 'comentario_verificacion_html', type: 'text', nullable: true })
  comentario_verificacion_html?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion_corta: string;

  @Column({
    type: 'enum',
    enum: EtapaProyecto,
    nullable: true,
  })
  etapa_observada: EtapaProyecto;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;

  @ManyToOne(() => Asesor, (asesor) => asesor.observaciones_realizadas, {
    eager: true,
  })
  autor: Asesor;

  @ManyToOne(() => Documento, (documento) => documento.observaciones, {
    eager: true,
  })
  documento: Documento;

  @OneToOne(() => Correccion, (correccion) => correccion.observacion, {
    nullable: true,
  })
  correccion: Correccion | null;
}