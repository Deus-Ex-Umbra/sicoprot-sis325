// src/evaluacion-tribunal/entidades/evaluacion-tribunal.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entidades/usuario.entidad';
import { Proyecto } from '../../proyectos/entidades/proyecto.endidad';

@Entity('evaluaciones_tribunal')
export class EvaluacionTribunal {
    @PrimaryGeneratedColumn()
    id: number;

    // Relación: quién evalúa → un usuario con rol Tribunal
    @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tribunal_id' })
    tribunal: Usuario;

    // Relación: sobre qué proyecto
    @ManyToOne(() => Proyecto, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'proyecto_id' })
    proyecto: Proyecto;

    // Contenido de la evaluación
    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @Column({ type: 'int', nullable: true })
    calificacion: number; // o podrías usar un enum si es cualitativa

    @Column({ default: false })
    estaEnviada: boolean; // ¿Ya se envió formalmente?

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
}