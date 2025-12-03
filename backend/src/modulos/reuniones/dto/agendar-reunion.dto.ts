import { IsDateString } from 'class-validator';

export class AgendarReunionDto {
  @IsDateString()
  fecha_programada: string;
}
