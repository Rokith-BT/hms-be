import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from 'class-validator';

export enum FilledUsingEnum {
    Voice = 'voice',
    Scribble = 'scribble',
    Text = 'text',
}
export class pasttreatmentHistoru {
    @ApiProperty({ description: 'opd_id of the case sheet', example: 1 })
    opd_id: number; 

    @ApiProperty({ description: 'past treatment history of the patient', example:"history of the report will be written here" })
    history: string; 

    @ApiProperty({ example: 'voice', description: 'Method used to fill the prescription', enum: FilledUsingEnum })
    @IsEnum(FilledUsingEnum, { message: 'filled_using must be one of: voice, scribble, text' })
    filled_using: FilledUsingEnum;
}
