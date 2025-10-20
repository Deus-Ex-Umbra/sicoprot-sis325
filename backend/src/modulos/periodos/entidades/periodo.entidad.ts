import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Grupo } from '../../grupos/entidades/grupo.entidad';

@Entity('periodos')
export class Periodo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'fecha_inicio_semestre', type: 'date' })
  fecha_inicio_semestre: Date;

  @Column({ name: 'fecha_fin_semestre', type: 'date' })
  fecha_fin_semestre: Date;

  @Column({ name: 'fecha_inicio_inscripciones', type: 'date' })
  fecha_inicio_inscripciones: Date;

  @Column({ name: 'fecha_fin_inscripciones', type: 'date' })
  fecha_fin_inscripciones: Date;

  @Column({ type: 'boolean', default: false })
  activo: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @OneToMany(() => Grupo, (grupo) => grupo.periodo)
  grupos: Grupo[];
}