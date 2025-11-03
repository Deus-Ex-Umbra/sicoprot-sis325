import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Usuario } from '../../usuarios/entidades/usuario.entidad';
import { Proyecto } from '../../proyectos/entidades/proyecto.endidad';
import { Grupo } from '../../grupos/entidades/grupo.entidad';
import { Correccion } from '../../correcciones/entidades/correccion.entidad';
import { PropuestaTema } from '../../propuestas-tema/entidades/propuesta-tema.entidad';

@Entity('estudiantes')
export class Estudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  @Column({ type: 'text', nullable: true })
  ruta_foto: string;

  @OneToOne(() => Usuario, { cascade: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToMany(() => Grupo, (grupo) => grupo.estudiantes)
  @JoinTable({
    name: 'estudiante_grupos',
    joinColumn: { name: 'estudiante_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'grupo_id', referencedColumnName: 'id' },
  })
  grupos: Grupo[];

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.estudiantes)
  proyecto: Proyecto;
  

  @OneToMany(() => Correccion, (correccion) => correccion.estudiante)
  correcciones: Correccion[]

  @OneToMany(() => PropuestaTema, (propuesta) => propuesta.estudiante)
  propuestas_tema: PropuestaTema[];
}