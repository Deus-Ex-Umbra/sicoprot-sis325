import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Observacion } from '../../observaciones/entidades/observacion.entidad';
import { Estudiante } from '../../estudiantes/entidades/estudiante.entidad';
import { Documento } from '../../documentos/entidades/documento.entidad';

@Entity('correcciones')
export class Correccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  descripcion: string;

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

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @OneToOne(() => Observacion, (observacion) => observacion.correccion)
  @JoinColumn()
  observacion: Observacion;

  @ManyToOne(() => Estudiante, { eager: true })
  estudiante: Estudiante;

  @ManyToOne(() => Documento)
  documento: Documento;
}