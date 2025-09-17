import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entidades/usuario.entidad';
import { Documento } from '../../documentos/entidades/documento.entidad';

@Entity('proyectos')
export class Proyecto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 300 })
  titulo: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.proyectos, { eager: true })
  estudiante: Usuario;

  @ManyToOne(() => Usuario, (usuario) => usuario.proyectosAsesorados, { eager: true })
  asesor: Usuario;

  @OneToMany(() => Documento, (documento) => documento.proyecto)
  documentos: Documento[];
}