import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoReunion } from '../entidades/reunion.entidad';

export class ActualizarReunionDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  fecha_programada?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  fecha_realizada?: string;

  @ApiProperty({ required: false })
  @IsEnum(EstadoReunion)
  @IsOptional()
  estado?: EstadoReunion;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notas_reunion_html?: string;
}