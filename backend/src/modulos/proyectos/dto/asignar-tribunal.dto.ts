import { IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class AsignarTribunalDto {
    @IsArray()
    @ArrayMinSize(3)
    @ArrayMaxSize(5)
    tribunalIds: number[];
}