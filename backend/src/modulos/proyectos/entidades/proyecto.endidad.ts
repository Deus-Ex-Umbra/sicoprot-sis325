import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Documento } from '../../documentos/entidades/documento.entidad';
import { Estudiante } from '../../estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../../asesores/entidades/asesor.entidad';

import { EtapaProyecto } from '../enums/etapa-proyecto.enum';
@Entity('proyectos')
export class Proyecto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 300 })
  titulo: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  // @ManyToOne(() => Estudiante, (estudiante) => estudiante.proyectos, { eager: true })
  // estudiante: Estudiante;
  
  @OneToMany(() => Estudiante, (estudiante) => estudiante.proyecto)
  estudiantes: Estudiante[]; // ← plural, porque tiene MUCHOS estudiantes

  @ManyToOne(() => Asesor, (asesor) => asesor.proyectos_asesorados, { eager: true })
  asesor: Asesor;

  // @OneToMany(() => Documento, (documento) => documento.proyecto)
  // documentos: Documento[];
  
  @OneToMany(() => Documento, (documento) => documento.proyecto)
  documentos: Documento[]; // Inversa

  @Column({ type: 'enum', enum: EtapaProyecto, default: EtapaProyecto.PROPUESTA })
  etapa_actual: EtapaProyecto;

  @Column({ type: 'boolean', default: false })
  propuesta_aprobada: boolean;

  @Column({ type: 'boolean', default: false })
  perfil_aprobado: boolean;

  @Column({ type: 'boolean', default: false })
  proyecto_aprobado: boolean;

  @Column({ name: 'fecha_aprobacion_propuesta', type: 'timestamp', nullable: true })
  fecha_aprobacion_propuesta?: Date;

  @Column({ name: 'fecha_aprobacion_perfil', type: 'timestamp', nullable: true })
  fecha_aprobacion_perfil?: Date;

  @Column({ name: 'fecha_aprobacion_proyecto', type: 'timestamp', nullable: true })
  fecha_aprobacion_proyecto?: Date;

  @Column({ name: 'comentario_aprobacion_propuesta', type: 'text', nullable: true })
  comentario_aprobacion_propuesta?: string;

  @Column({ name: 'comentario_aprobacion_perfil', type: 'text', nullable: true })
  comentario_aprobacion_perfil?: string;

  @Column({ name: 'comentario_aprobacion_proyecto', type: 'text', nullable: true })
  comentario_aprobacion_proyecto?: string;  

  @Column({ type: 'text', nullable: true })
  resumen?: string;

  @Column({ type: 'simple-array', nullable: true })
  palabras_clave: string[] = [];
}