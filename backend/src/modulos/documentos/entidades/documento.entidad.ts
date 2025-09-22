import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Proyecto } from '../../proyectos/entidades/proyecto.endidad';
import { Observacion } from '../../observaciones/entidades/observacion.entidad';

@Entity('documentos')
export class Documento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre_archivo: string;

  @Column()
  ruta_archivo: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @CreateDateColumn({ name: 'fecha_subida' })
  fecha_subida: Date;

  // @ManyToOne(() => Proyecto, (proyecto) => proyecto.documentos)
  // proyecto: Proyecto;
  
  @ManyToOne(() => Proyecto, (proyecto) => proyecto.documentos, { eager: true })
  proyecto: Proyecto;

  @OneToMany(() => Observacion, (observacion) => observacion.documento)
  observaciones: Observacion[];
}