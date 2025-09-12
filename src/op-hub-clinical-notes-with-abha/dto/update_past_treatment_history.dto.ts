import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from 'class-validator';

export enum FilledUsingEnum {
    Voice = 'voice',
    Scribble = 'scribble',
    Text = 'text',
}
export class UpdatepasttreatmentHistoru {
    @ApiProperty({ description: 'id of the past treatment history', example: 1 })
    id: number; 

    @ApiProperty({ description: 'past treatment history of the patient', example:"history of the report will be written here" })
    history: string; 

    @ApiProperty({ example: 'voice', description: 'Method used to fill the prescription', enum: FilledUsingEnum })
    @IsEnum(FilledUsingEnum, { message: 'filled_using must be one of: voice, scribble, text' })
    filled_using: FilledUsingEnum;
}
