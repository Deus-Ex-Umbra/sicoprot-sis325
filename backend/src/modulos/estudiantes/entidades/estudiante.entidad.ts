import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { Usuario } from '../../usuarios/entidades/usuario.entidad';
import { Proyecto } from '../../proyectos/entidades/proyecto.endidad';
import { Grupo } from '../../grupos/entidades/grupo.entidad';
import { Correccion } from '../../correcciones/entidades/correccion.entidad';

@Entity('estudiantes')
export class Estudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  @OneToOne(() => Usuario, { cascade: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Grupo, (grupo) => grupo.estudiantes, { nullable: true })
  grupo: Grupo;

  // @OneToMany(() => Proyecto, (proyecto) => proyecto.estudiante)
  // proyectos: Proyecto[];
  @ManyToOne(() => Proyecto, (proyecto) => proyecto.estudiantes)
  proyecto: Proyecto; // ← singular, porque pertenece a UN proyecto
  

  @OneToMany(() => Correccion, (correccion) => correccion.estudiante)
  correcciones: Correccion[]
}