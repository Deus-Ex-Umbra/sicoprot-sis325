import { IsBoolean, IsString, IsArray, IsOptional, ValidateNested, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class TribunalDto {
  @ApiProperty({ description: 'Nombre del docente' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Correo electrónico del docente' })
  @IsEmail()
  @IsNotEmpty()
  correo: string;
}

export class ResponderSolicitudDefensaDto {
  @ApiProperty({ description: 'Aprobar o rechazar la solicitud' })
  @IsBoolean()
  aprobada: boolean;

  @ApiProperty({ description: 'Comentarios del administrador', required: false })
  @IsString()
  @IsOptional()
  comentarios?: string;

  @ApiProperty({ 
    description: 'Tribunales asignados (3-5 docentes)',
    type: [TribunalDto],
    required: false
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TribunalDto)
  @IsOptional()
  tribunales?: TribunalDto[];
}