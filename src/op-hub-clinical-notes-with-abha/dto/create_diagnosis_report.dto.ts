import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from 'class-validator';

export enum FilledUsingEnum {
    Voice = 'voice',
    Scribble = 'scribble',
    Text = 'text',
}
export class diagnosisReport {
    @ApiProperty({ description: 'opd_id of the case sheet', example: 1 })
    opd_id: number; 
    @ApiProperty({ description: 'category of the report', example:"Pathology" })
    test_categories: string; 
    @ApiProperty({ description: 'sub_category of the report', example:"blood test" })
    sub_category: string; 
    @ApiProperty({ description: 'laboratory of the report', example:"laboratory" })
    laboratory: string; 
    @ApiProperty({ description: 'remarks of the report', example:"remarks of the report will be written here" })
    remarks: string; 
    @ApiProperty({ example: 'voice', description: 'Method used to fill the prescription', enum: FilledUsingEnum })
    @IsEnum(FilledUsingEnum, { message: 'filled_using must be one of: voice, scribble, text' })
    filled_using: FilledUsingEnum; 
}
