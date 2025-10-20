import { PartialType } from '@nestjs/mapped-types';
import { CrearGrupoDto } from './crear-grupo.dto';

export class ActualizarGrupoDto extends PartialType(CrearGrupoDto) {}