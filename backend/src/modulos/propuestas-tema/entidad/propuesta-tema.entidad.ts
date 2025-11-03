import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Proyecto } from '../../proyectos/entidades/proyecto.endidad';
import { Estudiante } from '../../estudiantes/entidades/estudiante.entidad';
import { EstadoPropuesta } from '../enums/estado-propuesta.enum';

@Entity('propuestas_tema')
export class PropuestaTema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 300 })
  titulo: string;

  @Column('text')
  cuerpo_html: string;

  @Column({
    type: 'enum',
    enum: EstadoPropuesta,
    default: EstadoPropuesta.PENDIENTE,
  })
  estado: EstadoPropuesta;

  @Column({ type: 'text', nullable: true })
  comentarios_asesor_html: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.propuestas_tema)
  proyecto: Proyecto;

  @ManyToOne(() => Estudiante, (estudiante) => estudiante.propuestas_tema)
  estudiante: Estudiante;
}