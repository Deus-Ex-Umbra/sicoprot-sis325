import { IsBoolean, IsString, IsArray, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResponderSolicitudDefensaDto {
  @ApiProperty({ description: 'Aprobar o rechazar la solicitud' })
  @IsBoolean()
  aprobada: boolean;

  @ApiProperty({ description: 'Comentarios del administrador', required: false })
  @IsString()
  @IsOptional()
  comentarios?: string;

  // Campos requeridos cuando se aprueba la solicitud (para crear la pre-defensa)
  @ApiProperty({ 
    description: 'Fecha y hora programada para la pre-defensa',
    required: false
  })
  @IsDateString()
  @IsOptional()
  fecha_programada?: string;

  @ApiProperty({ description: 'Lugar de la pre-defensa', required: false })
  @IsString()
  @IsOptional()
  lugar?: string;

  @ApiProperty({ description: 'Enlace virtual para la pre-defensa', required: false })
  @IsString()
  @IsOptional()
  enlace?: string;

  @ApiProperty({ 
    description: 'IDs de los asesores que conformarán el tribunal (mínimo 3)',
    type: [Number],
    required: false
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  ids_tribunales?: number[];
}