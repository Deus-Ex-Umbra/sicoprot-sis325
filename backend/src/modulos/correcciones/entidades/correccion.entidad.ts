import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Observacion } from '../../observaciones/entidades/observacion.entidad';
import { Estudiante } from '../../estudiantes/entidades/estudiante.entidad';
import { Documento } from '../../documentos/entidades/documento.entidad';
import { EstadoCorreccion } from '../enums/estado-correccion.enum';

/**
 * ENTIDAD: Representa una corrección que un estudiante hace sobre una observación.
 * 
 * Flujo:
 * 1. Asesor crea Observación (estado: PENDIENTE)
 * 2. Estudiante corrige y crea esta entidad Corrección
 * 3. Asesor verifica la Corrección (acepta o rechaza)
 * 
 * VERSIÓN FUSIONADA:
 * - Incluye campos de ubicación (coordenadas, páginas) de la versión comentada
 * - Incluye workflow completo de estados
 * - Incluye relaciones necesarias
 */
@Entity('correcciones')
export class Correccion {
  @PrimaryGeneratedColumn()
  id: number;

  // ========== INFORMACIÓN BÁSICA ==========
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  titulo?: string;  // Título opcional de la corrección

  @Column('text')
  descripcion: string;  // Descripción detallada de qué corrigió el estudiante

  @Column({ type: 'int' })
  version_corregida: number;  // En qué versión del documento se hizo la corrección

  // ========== UBICACIÓN EN EL DOCUMENTO ==========
  
  // Coordenadas individuales (de la versión comentada - más flexible para queries)
  @Column({ type: 'float', nullable: true })
  x_inicio?: number;

  @Column({ type: 'float', nullable: true })
  y_inicio?: number;

  @Column({ type: 'float', nullable: true })
  x_fin?: number;

  @Column({ type: 'float', nullable: true })
  y_fin?: number;

  @Column({ type: 'int', nullable: true })
  pagina_inicio?: number;

  @Column({ type: 'int', nullable: true })
  pagina_fin?: number;

  // Alternativa: Coordenadas como JSON (de la versión actual - más compacto)
  @Column({ type: 'json', nullable: true })
  coordenadas?: {
    x_inicio?: number;
    y_inicio?: number;
    x_fin?: number;
    y_fin?: number;
  };

  // Metadatos adicionales de ubicación
  @Column({ type: 'int', nullable: true })
  pagina?: number;  // Página específica (alternativa a pagina_inicio/fin)

  @Column({ type: 'varchar', length: 100, nullable: true })
  seccion?: string;  // Ej: "Capítulo 3", "Anexo A", "Conclusiones"

  // ========== ESTILO VISUAL ==========
  
  @Column({ type: 'varchar', length: 7, default: '#28a745' })
  color: string;  // Color para resaltar en el PDF (verde por defecto)

  // ========== ESTADO DE LA CORRECCIÓN ==========
  
  @Column({
    type: 'enum',
    enum: EstadoCorreccion,
    default: EstadoCorreccion.PENDIENTE_REVISION,
  })
  estado: EstadoCorreccion;

  // Campo alternativo para compatibilidad con código existente
  @Column({ 
    type: 'enum', 
    enum: ['PENDIENTE', 'APROBADA', 'RECHAZADA'], 
    default: 'PENDIENTE',
    nullable: true,
  })
  estado_verificacion?: string;

  // ========== VERIFICACIÓN POR EL ASESOR ==========
  
  @Column({ type: 'text', nullable: true })
  comentario_verificacion?: string;  // Comentario del asesor al verificar

  @Column({ type: 'timestamp', nullable: true })
  fecha_verificacion?: Date;  // Cuándo el asesor verificó

  // ========== METADATOS TEMPORALES ==========
  
  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;

  // ========== RELACIONES ==========
  
  /**
   * Relación 1:1 con Observación
   * Una corrección pertenece a UNA observación
   * Si se elimina la observación, se elimina la corrección
   */
  @OneToOne(() => Observacion, (observacion) => observacion.correccion, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'observacion_id' })
  observacion: Observacion;

  /**
   * Relación N:1 con Estudiante
   * Muchas correcciones pueden ser hechas por UN estudiante
   */
  @ManyToOne(() => Estudiante, (estudiante) => estudiante.correcciones, {
    eager: true,
  })
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  /**
   * Relación N:1 con Documento (opcional)
   * Permite vincular directamente al documento sin pasar por observación
   * Útil para correcciones generales no vinculadas a observaciones específicas
   */
  @ManyToOne(() => Documento, { nullable: true })
  @JoinColumn({ name: 'documento_id' })
  documento?: Documento;
}

/**
 * NOTAS DE DISEÑO:
 * 
 * 1. COORDENADAS:
 *    - Se mantienen ambos enfoques (columnas individuales + JSON)
 *    - Usar columnas individuales para queries SQL (WHERE x_inicio > X)
 *    - Usar JSON para almacenamiento compacto si no se hacen queries
 * 
 * 2. PÁGINAS:
 *    - pagina_inicio/pagina_fin: Para correcciones que abarcan múltiples páginas
 *    - pagina: Para correcciones en una sola página
 * 
 * 3. ESTADOS:
 *    - estado: Enum principal (EstadoCorreccion)
 *    - estado_verificacion: Para compatibilidad con código existente
 * 
 * 4. RELACIÓN CON DOCUMENTO:
 *    - Opcional para permitir correcciones sin observación previa
 *    - Útil si en el futuro se implementan correcciones independientes
 * 
 * 5. COLOR:
 *    - Permite al frontend resaltar la corrección en el PDF
 *    - Verde (#28a745) por defecto = corrección exitosa
 * 
 * VERSIÓN ANTERIOR COMENTADA:
 * Se mantuvieron todos los campos de la versión comentada:
 * - titulo, x_inicio, y_inicio, x_fin, y_fin
 * - pagina_inicio, pagina_fin, color
 * - Relación con Documento
 * 
 * Se agregó de la nueva versión:
 * - EstadoCorreccion enum
 * - UpdateDateColumn
 * - Campos de verificación mejorados
 * - Documentación completa
 */