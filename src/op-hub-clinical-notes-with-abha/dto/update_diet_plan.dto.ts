import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from 'class-validator';

export enum FilledUsingEnum {
    Voice = 'voice',
    Scribble = 'scribble',
    Text = 'text',
}
export class UpdatedietPlan {
    @ApiProperty({ description: 'id of the diet plan', example: 1 })
    id: number; 


    @ApiProperty({ description: 'diet plan for the patients', example: "diet plan for the patients" })
    diet_plan: string; 

    @ApiProperty({ example: 'voice', description: 'Method used to fill the prescription', enum: FilledUsingEnum })
    @IsEnum(FilledUsingEnum, { message: 'filled_using must be one of: voice, scribble, text' })
    filled_using: FilledUsingEnum; 
   }
