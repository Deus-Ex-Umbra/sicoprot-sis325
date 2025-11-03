import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SolicitarDefensaDto {
  @ApiProperty({
    description: 'Ruta o identificador del archivo memorial PDF subido',
    example: 'uploads/memorial_juan_perez.pdf',
  })
  @IsString()
  @IsNotEmpty()
  ruta_memorial: string;
}