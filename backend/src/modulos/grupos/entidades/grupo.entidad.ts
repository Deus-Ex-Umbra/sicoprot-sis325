import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Asesor } from '../../asesores/entidades/asesor.entidad';
import { Estudiante } from '../../estudiantes/entidades/estudiante.entidad';
import { Periodo } from '../../periodos/entidades/periodo.entidad';

@Entity('grupos')
export class Grupo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @ManyToOne(() => Asesor, (asesor) => asesor.grupos, { eager: true })
  asesor: Asesor;

  @ManyToOne(() => Periodo, (periodo) => periodo.grupos, { eager: true })
  periodo: Periodo;

  @OneToMany(() => Estudiante, (estudiante) => estudiante.grupo)
  estudiantes: Estudiante[];

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;
}