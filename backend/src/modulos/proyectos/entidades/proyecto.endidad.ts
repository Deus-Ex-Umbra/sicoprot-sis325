import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Documento } from '../../documentos/entidades/documento.entidad';
import { Estudiante } from '../../estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../../asesores/entidades/asesor.entidad';

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

  
}