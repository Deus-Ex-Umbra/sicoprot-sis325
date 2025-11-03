import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoObservacion } from '../enums/estado-observacion.enum';

export class VerificarObservacionDto {
  @ApiProperty({
    description: 'Nuevo estado de verificación',
    enum: [EstadoObservacion.CORREGIDA, EstadoObservacion.RECHAZADO],
    example: EstadoObservacion.CORREGIDA,
  })
  @IsIn([EstadoObservacion.CORREGIDA, EstadoObservacion.RECHAZADO])
  nuevoEstado: EstadoObservacion;

  @ApiProperty({
    description: 'Comentarios en HTML de la verificación',
    required: false,
    example:
      '<p>La observación ha sido verificada <i>correctamente</i>.</p>',
  })
  @IsOptional()
  @IsString()
  verificacion_asesor_html?: string;
}