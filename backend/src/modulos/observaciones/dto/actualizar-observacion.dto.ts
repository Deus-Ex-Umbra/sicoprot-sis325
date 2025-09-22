import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EstadoObservacion } from '../enums/estado-observacion.enum';
import { ApiProperty } from '@nestjs/swagger';

export class ActualizarObservacionDto {
  @ApiProperty({
    description: 'Nuevo estado de la observación',
    enum: EstadoObservacion,
    example: EstadoObservacion.CORREGIDO,
  })
  @IsEnum(EstadoObservacion)
  @IsNotEmpty()
  estado: EstadoObservacion;

  @ApiProperty({
    description: 'Comentario opcional del asesor para guiar al estudiante',
    example: 'Revisar la redacción de la conclusión y ajustar las referencias APA.',
    required: false,
  })
  @IsOptional()
  @IsString()
  comentarios_asesor?: string;
}
