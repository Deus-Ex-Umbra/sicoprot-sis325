import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Rol } from '../../usuarios/enums/rol.enum';

export enum EstadoSolicitud {
  Pendiente = 'pendiente',
  Aprobada = 'aprobada',
  Rechazada = 'rechazada',
}

@Entity('solicitudes_registro')
export class SolicitudRegistro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  correo: string;

  @Column({ type: 'varchar', length: 255 })
  contrasena: string;

  @Column({ type: 'enum', enum: Rol })
  rol: Rol;

  @Column({ type: 'enum', enum: EstadoSolicitud, default: EstadoSolicitud.Pendiente })
  estado: EstadoSolicitud;

  @Column({ type: 'text', nullable: true })
  comentarios_admin: string;

  @CreateDateColumn({ name: 'fecha_solicitud' })
  fecha_solicitud: Date;

  @UpdateDateColumn({ name: 'fecha_respuesta', nullable: true })
  fecha_respuesta: Date;
}