import { PartialType } from '@nestjs/mapped-types';
import { CrearPeriodoDto } from './crear-periodo.dto';

export class ActualizarPeriodoDto extends PartialType(CrearPeriodoDto) {}