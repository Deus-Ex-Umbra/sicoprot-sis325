import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Documento } from '../../documentos/entidades/documento.entidad';
import { Usuario } from '../../usuarios/entidades/usuario.entidad';

@Entity('observaciones')
export class Observacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  contenido: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @ManyToOne(() => Documento, (documento) => documento.observaciones)
  documento: Documento;

  @ManyToOne(() => Usuario, (usuario) => usuario.observacionesRealizadas, { eager: true })
  autor: Usuario;
}