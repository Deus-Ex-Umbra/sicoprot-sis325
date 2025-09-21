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
  
  @Column({ type: 'enum', enum: EstadoObservacion, default: EstadoObservacion.Pendiente })
  estado: EstadoObservacion;
  
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

  @ManyToOne(() => Documento, (documento) => documento.observaciones)
  documento: Documento;

  @ManyToOne(() => Asesor, (asesor) => asesor.observaciones_realizadas, { eager: true })
  autor: Asesor;

  @OneToOne(() => Correccion, (correccion) => correccion.observacion, { nullable: true })
  correccion: Correccion;
}