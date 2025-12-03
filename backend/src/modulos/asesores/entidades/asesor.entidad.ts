import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../usuarios/entidades/usuario.entidad';
import { Proyecto } from '../../proyectos/entidades/proyecto.endidad';
import { Observacion } from '../../observaciones/entidades/observacion.entidad';
import { Grupo } from '../../grupos/entidades/grupo.entidad';
import { Reunion } from '../../reuniones/entidades/reunion.entidad';

@Entity('asesores')
export class Asesor {
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

  @OneToMany(() => Proyecto, (proyecto) => proyecto.asesor)
  proyectos_asesorados: Proyecto[];

  @OneToMany(() => Observacion, (observacion) => observacion.autor)
  observaciones_realizadas: Observacion[];

  @OneToMany(() => Grupo, (grupo) => grupo.asesor)
  grupos: Grupo[];

  @OneToMany(() => Reunion, (reunion) => reunion.asesor)
  reuniones_agendadas: Reunion[];
}