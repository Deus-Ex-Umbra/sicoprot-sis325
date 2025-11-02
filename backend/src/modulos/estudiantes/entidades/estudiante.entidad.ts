import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
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
}