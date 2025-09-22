import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Documento } from '../../documentos/entidades/documento.entidad';
import { Asesor } from '../../asesores/entidades/asesor.entidad';
import { EstadoObservacion } from '../enums/estado-observacion.enum';
import { Correccion } from '../../correcciones/entidades/correccion.entidad';

@Entity('observaciones')
export class Observacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  titulo: string;

  @Column('text')
  contenido: string;
  
  @Column({ type: 'enum', enum: EstadoObservacion, default: EstadoObservacion.PENDIENTE })
  estado: EstadoObservacion;
  
  @Column({ nullable: true, type: 'text' }) // 'text' para comentarios largos, o 'varchar' si prefieres
  comentarios_asesor?: string;

  @Column({ type: 'float' })
  x_inicio: number;

  @Column({ type: 'float' })
  y_inicio: number;

  @Column({ type: 'float' })
  x_fin: number;

  @Column({ type: 'float' })
  y_fin: number;

  @Column({ type: 'int' })
  pagina_inicio: number;

  @Column({ type: 'int' })
  pagina_fin: number;

  @Column({ type: 'boolean', default: false })
  archivada: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;

  @ManyToOne(() => Asesor, (asesor) => asesor.observaciones_realizadas, { eager: true })
  autor: Asesor;
  
  @ManyToOne(() => Documento, (documento) => documento.observaciones, { eager: true }) // eager: true para cargar automáticamente
  documento: Documento;

  @OneToOne(() => Correccion, (correccion) => correccion.observacion, { nullable: true })
  correccion: Correccion;
}