import { Index, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm'; 
import { Documento } from '../../documentos/entidades/documento.entidad'; 
import { Asesor } from '../../asesores/entidades/asesor.entidad'; 
import { EstadoObservacion } from '../enums/estado-observacion.enum'; 
import { Correccion } from '../../correcciones/entidades/correccion.entidad';



@Entity('observaciones')
@Index(['documento', 'version_observada']) // ← Nuevo
@Index(['estado']) // ← Nuevo
export class Observacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  titulo: string;

  @Column('text')
  contenido_detallado: string;
    
  @Column({ type: 'enum', enum: EstadoObservacion, default: EstadoObservacion.PENDIENTE })
  estado: EstadoObservacion;
    
  @Column({ nullable: true, type: 'text' })
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

  // 🎯 CAMPOS ADICIONALES PARA LA HISTORIA DE USUARIO
  @Column({ name: 'version_observada', type: 'int', nullable: true })
  version_observada?: number; // En qué versión del documento se hizo la observación

  @Column({ name: 'version_corregida', type: 'int', nullable: true })
  version_corregida?: number; // En qué versión se dice que fue corregida

  @Column({ name: 'fecha_verificacion', type: 'timestamp', nullable: true })
  fecha_verificacion?: Date; // Cuándo el asesor verificó la corrección

  @Column({ name: 'comentario_verificacion', type: 'text', nullable: true })
  comentario_verificacion?: string; // Comentario del asesor al verificar
  
  @Column()
  descripcion_corta: string;

  @Column({
    type: 'enum',
    enum: ['pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente',
  })
  estado_revision:string;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  
  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;

  @ManyToOne(() => Asesor, (asesor) => asesor.observaciones_realizadas, { eager: true })
  autor: Asesor;
    
  @ManyToOne(() => Documento, (documento) => documento.observaciones, { eager: true })
  documento: Documento;

  @OneToOne(() => Correccion, (correccion) => correccion.observacion, { nullable: true })
  correccion: Correccion;
}