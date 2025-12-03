import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Documento } from '../../documentos/entidades/documento.entidad';
import { Estudiante } from '../../estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../../asesores/entidades/asesor.entidad';
import { EtapaProyecto } from '../enums/etapa-proyecto.enum';
import { Reunion } from '../../reuniones/entidades/reunion.entidad';
import { Observacion } from '../../observaciones/entidades/observacion.entidad';

@Entity('proyectos')
export class Proyecto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 300 })
  titulo: string;

  @Column({ type: 'text' })
  cuerpo_html: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @OneToMany(() => Estudiante, (estudiante) => estudiante.proyecto)
  estudiantes: Estudiante[]; 

  @ManyToOne(() => Asesor, (asesor) => asesor.proyectos_asesorados, { eager: true })
  asesor: Asesor;
  
  @OneToMany(() => Documento, (documento) => documento.proyecto)
  documentos: Documento[];

  @OneToMany(() => Reunion, (reunion) => reunion.proyecto)
  reuniones: Reunion[];

  @OneToMany(() => Observacion, (observacion) => observacion.proyecto)
  observaciones: Observacion[];

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

  @Column({ type: 'boolean', default: false })
  listo_para_defender: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ruta_memorial: string;

  @Column({ type: 'text', nullable: true })
  comentarios_defensa: string;

  @Column({ type: 'jsonb', nullable: true })
  tribunales: { nombre: string; correo: string }[];
}