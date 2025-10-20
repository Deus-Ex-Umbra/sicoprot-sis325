import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EstadoSolicitud } from '../entidades/solicitud-registro.entidad';
import { ApiProperty } from '@nestjs/swagger';

export class ResponderSolicitudDto {
  @ApiProperty({ description: 'Respuesta a la solicitud', enum: ['aprobada', 'rechazada'], example: 'aprobada' })
  @IsEnum(['aprobada', 'rechazada'], { message: 'El estado debe ser aprobada o rechazada.' })
  @IsNotEmpty()
  estado: 'aprobada' | 'rechazada';

  @ApiProperty({ description: 'Comentarios del administrador', example: 'Solicitud aprobada', required: false })
  @IsString()
  @IsOptional()
  comentarios_admin?: string;
}