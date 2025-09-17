import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CrearProyectoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsUUID()
  @IsNotEmpty()
  estudianteId: string;

  @IsUUID()
  @IsNotEmpty()
  asesorId: string;
}