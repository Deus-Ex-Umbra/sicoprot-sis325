import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Rol } from '../enums/rol.enum';
import { Estudiante } from '../../estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../../asesores/entidades/asesor.entidad';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  correo: string;

  @Column({ type: 'varchar', length: 255, select: false })
  contrasena: string;

  @Column({ type: 'enum', enum: Rol, default: Rol.Estudiante })
  rol: Rol;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamp' })
  actualizado_en: Date;

  @OneToOne(() => Estudiante, (estudiante) => estudiante.usuario)
  estudiante: Estudiante;

  @OneToOne(() => Asesor, (asesor) => asesor.usuario)
  asesor: Asesor;
}