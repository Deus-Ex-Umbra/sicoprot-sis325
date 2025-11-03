import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoPropuesta } from '../enums/estado-propuesta.enum';

export class ResponderPropuestaDto {
  @ApiProperty({
    description: 'Acción a tomar sobre la propuesta',
    enum: [EstadoPropuesta.APROBADA, EstadoPropuesta.RECHAZADA],
    example: EstadoPropuesta.APROBADA,
  })
  @IsEnum([EstadoPropuesta.APROBADA, EstadoPropuesta.RECHAZADA])
  @IsNotEmpty()
  accion: EstadoPropuesta.APROBADA | EstadoPropuesta.RECHAZADA;

  @ApiProperty({
    description: 'Comentarios del asesor en formato HTML (opcional)',
    example: '<p>Propuesta <b>aprobada</b>. Iniciar con el perfil.</p>',
    required: false,
  })
  @IsOptional()
  @IsString()
  comentarios_asesor_html?: string;
}