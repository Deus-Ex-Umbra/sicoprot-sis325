import { IsString, IsInt } from 'class-validator';

export class CrearObservacionReunionDto {
  @IsInt()
  id_reunion: number;

  @IsString()
  descripcion: string;
}
