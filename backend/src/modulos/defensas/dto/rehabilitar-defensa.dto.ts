import { IsInt } from 'class-validator';

export class RehabilitarDefensaDto {
  @IsInt()
  id_proyecto: number;
}
