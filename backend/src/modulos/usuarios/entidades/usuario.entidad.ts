import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Rol } from '../enums/rol.enum';
import { EstadoUsuario } from '../enums/estado-usuario.enum';
import { Estudiante } from '../../estudiantes/entidades/estudiante.entidad';
import { Asesor } from '../../asesores/entidades/asesor.entidad';
import {Proyecto} from '../../proyectos/entidades/proyecto.endidad';
@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ unique: true })
  ci: string;
  
  @Column({ type: 'varchar', length: 255, unique: true })
  correo: string;

  @Column({ type: 'varchar', length: 255, select: false })
  contrasena: string;

  @Column({ type: 'enum', enum: Rol, default: Rol.Estudiante })
  rol: Rol;

  @Column({ type: 'enum', enum: EstadoUsuario, default: EstadoUsuario.Pendiente })
  estado: EstadoUsuario;

  @Column({ name: 'fecha_aprobacion', type: 'timestamp', nullable: true })
  fecha_aprobacion: Date|null;
  
  
  @Column({ type: 'text', nullable: true })
  ruta_foto: string | null;
  

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamp' })
  actualizado_en: Date;

  // @OneToOne(() => Estudiante, (estudiante) => estudiante.usuario)
  // estudiante: Estudiante;

  // @OneToOne(() => Asesor, (asesor) => asesor.usuario)
  // asesor: Asesor;

  @OneToOne(() => Estudiante, (estudiante) => estudiante.usuario)
  estudiante: Estudiante | null; // ✅

  @OneToOne(() => Asesor, (asesor) => asesor.usuario)
  asesor: Asesor | null; // ✅
  // En src/usuario/entidades/usuario.entity.ts
  @ManyToMany(() => Proyecto, (proyecto) => proyecto.tribunales)
  proyectosTribunal: Proyecto[];
  // Relación inversa (opcional, pero útil para queries desde Usuario)
  @ManyToMany(() => Proyecto, (proyecto) => proyecto.tribunales)
  proyectosComoTribunal: Proyecto[];
}