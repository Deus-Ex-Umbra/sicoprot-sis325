import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, CreateDateColumn } from 'typeorm';
import { Asesor } from '../../asesores/entidades/asesor.entidad';
import { Estudiante } from '../../estudiantes/entidades/estudiante.entidad';
import { Periodo } from '../../periodos/entidades/periodo.entidad';
import { TipoGrupo } from '../enums/tipo-grupo.enum';

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

  @Column({ type: 'varchar', length: 100, nullable: true })
  carrera: string;

  @Column({
    type: 'enum',
    enum: TipoGrupo,
    default: TipoGrupo.TALLER_GRADO_I,
  })
  tipo: TipoGrupo;

  @ManyToOne(() => Asesor, (asesor) => asesor.grupos, { eager: true })
  asesor: Asesor;

  @ManyToOne(() => Periodo, (periodo) => periodo.grupos, { eager: true })
  periodo: Periodo;

  @ManyToMany(() => Estudiante, (estudiante) => estudiante.grupos)
  estudiantes: Estudiante[];

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;
}