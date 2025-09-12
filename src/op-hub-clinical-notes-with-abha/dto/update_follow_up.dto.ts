import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from 'class-validator';

export enum FilledUsingEnum {
    Voice = 'voice',
    Scribble = 'scribble',
    Text = 'text',
}
export class UpdatefollowUp {
    @ApiProperty({ description: 'id of the follow up', example: 1 })
    id: number; 

    @ApiProperty({ description: 'count of time limit', example: 1 })
    count: string; 

    @ApiProperty({ description: 'limit of the duration', example: "days" })
    duration_limit: string;

    @ApiProperty({ description: 'date for follow up', example: "2024-11-11" })
    date: Date; 

    @ApiProperty({ description: 'remark for follow up', example: "head is paining for the past 2 days" })
    remarks: string; 

    @ApiProperty({ example: 'voice', description: 'Method used to fill the prescription', enum: FilledUsingEnum })
    @IsEnum(FilledUsingEnum, { message: 'filled_using must be one of: voice, scribble, text' })
    filled_using: FilledUsingEnum; 
}
