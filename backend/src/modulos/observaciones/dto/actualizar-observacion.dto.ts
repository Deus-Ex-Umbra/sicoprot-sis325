import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoObservacion } from '../enums/estado-observacion.enum';
import { ApiProperty } from '@nestjs/swagger';

export class ActualizarObservacionDto {
  @ApiProperty({
    description: 'Nuevo estado de la observación',
    enum: EstadoObservacion,
    example: EstadoObservacion.Corregida,
  })
  @IsEnum(EstadoObservacion)
  @IsNotEmpty()
  estado: EstadoObservacion;
}