import { Entity,PrimaryGeneratedColumn,Column } from "typeorm";

export enum EstadoObservacion {
  PENDIENTE = 'pendiente',
  CORREGIDA = 'corregida',
  RECHAZADO = 'rechazado',
}