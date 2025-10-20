import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoUsuario } from '../../usuarios/enums/estado-usuario.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CambiarEstadoUsuarioDto {
  @ApiProperty({ description: 'Nuevo estado del usuario', enum: EstadoUsuario, example: EstadoUsuario.Activo })
  @IsEnum(EstadoUsuario)
  @IsNotEmpty()
  estado: EstadoUsuario;
}