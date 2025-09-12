import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from 'class-validator';

export enum FilledUsingEnum {
    Voice = 'voice',
    Scribble = 'scribble',
    Text = 'text',
}
export class UpdatepastTreatmentHistoryDocs {
    @ApiProperty({ description: 'id of the past treatment history document', example: 1 })
    id: number; 

    @ApiProperty({ description: 'opd_id of the chief Complaints basic', example: 1 })
    opd_id: number;
    
    @ApiProperty({ description: 'documents to be attached for treatment history', example: "document.pdf" })
    documents: string;
    
    @ApiProperty({ example: 'voice', description: 'Method used to fill the prescription', enum: FilledUsingEnum })
    @IsEnum(FilledUsingEnum, { message: 'filled_using must be one of: voice, scribble, text' })
    filled_using: FilledUsingEnum;
}
