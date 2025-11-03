import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoObservacion } from '../../observaciones/enums/estado-observacion.enum';

export class VerificarCorreccionDto {
  @ApiProperty({
    description: 'Resultado de la verificación del asesor',
    enum: [EstadoObservacion.CORREGIDA, EstadoObservacion.RECHAZADO],
    example: EstadoObservacion.CORREGIDA,
  })
  @IsIn([EstadoObservacion.CORREGIDA, EstadoObservacion.RECHAZADO], {
    message: 'El resultado debe ser CORREGIDA o RECHAZADO',
  })
  resultado: EstadoObservacion;

  @ApiProperty({
    description: 'Comentario en HTML del asesor explicando su decisión',
    example:
      '<p>Excelente trabajo. La corrección cumple con todos los requisitos.</p>',
    required: false,
  })
  @IsOptional()
  @IsString()
  comentario_verificacion_html?: string;
}