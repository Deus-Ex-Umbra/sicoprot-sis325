import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CrearObservacionDto {
  @IsString()
  @IsNotEmpty()
  contenido: string;

  @IsUUID()
  @IsNotEmpty()
  autorId: string;
}