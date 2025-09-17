import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Rol } from '../enums/rol.enum';
import { Proyecto } from '../../proyectos/entidades/proyecto.endidad';
import { Observacion } from '../../observaciones/entidades/observacion.entidad';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  correo: string;

  @Column({ type: 'varchar', length: 255, select: false })
  contrasena: string;

  @Column({ type: 'enum', enum: Rol, default: Rol.Estudiante })
  rol: Rol;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamp' })
  actualizadoEn: Date;

  @OneToMany(() => Proyecto, (proyecto) => proyecto.estudiante)
  proyectos: Proyecto[];

  @OneToMany(() => Proyecto, (proyecto) => proyecto.asesor)
  proyectosAsesorados: Proyecto[];

  @OneToMany(() => Observacion, (observacion) => observacion.autor)
  observacionesRealizadas: Observacion[];
}