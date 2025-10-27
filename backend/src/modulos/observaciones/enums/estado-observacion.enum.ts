import { Entity,PrimaryGeneratedColumn,Column } from "typeorm";

export enum EstadoObservacion {
  PENDIENTE = 'pendiente',
  CORREGIDO = 'corregida',
  RECHAZADO = 'rechazado'
}

@Entity('observaciones')
export class Observacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EstadoObservacion,
    default: EstadoObservacion.PENDIENTE,
  })
  estado: EstadoObservacion;
}