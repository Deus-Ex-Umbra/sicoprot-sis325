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


  @Column({ name: 'fecha_limite_propuesta', type: 'date', nullable: true })
  fecha_limite_propuesta?: Date;

  @Column({ name: 'fecha_limite_perfil', type: 'date', nullable: true })
  fecha_limite_perfil?: Date;

  @Column({ name: 'fecha_limite_proyecto', type: 'date', nullable: true })
  fecha_limite_proyecto?: Date;

  @Column({ name: 'dias_revision_asesor', type: 'int', default: 7 })
  dias_revision_asesor: number; // Días que el asesor tiene para revisar

  @Column({ name: 'dias_correccion_estudiante', type: 'int', default: 14 })
  dias_correccion_estudiante: number; // Días que el estudiante tiene para corregir
}