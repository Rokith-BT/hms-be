import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';


export enum FilledUsingEnum {
    Voice = 'voice',
    Scribble = 'scribble',
    Text = 'text',
}

export class UpdateOpdPrescriptionDto {
    @ApiProperty({ example: 1, description: 'Unique identifier for the prescription' })
    id: number;

    @ApiProperty({ example: 'Paracetamol', description: 'Name of the medicine' })
    medicine_name: string;

    @ApiProperty({ example: '1-1-1-1', description: 'Frequency of the medicine' })
    frequency: string;

    @ApiProperty({ example: '500mg', description: 'Dosage of the medicine' })
    dosage: string;

    @ApiProperty({ example: '5', description: 'Duration count of the treatment' })
    duration_count: string;

    @ApiProperty({ example: 'days', description: 'Duration limit (e.g., days, weeks)' })
    duration_limit: string;

    @ApiProperty({ example: '10', description: 'Quantity of the medicine', required: false })
    quantity?: string;

    @ApiProperty({ example: 'before meal', description: 'When to take the medicine', required: false })
    when?: string;

    @ApiProperty({ example: 'Take with water', description: 'Remarks or additional instructions', required: false })
    remarks?: string;

    @ApiProperty({ example: 'voice', description: 'Method used to fill the prescription', enum: FilledUsingEnum })
    @IsEnum(FilledUsingEnum, { message: 'filled_using must be one of: voice, scribble, text' })
    filled_using: FilledUsingEnum;

    @ApiProperty({ example: 1, description: 'Hospital ID where the prescription was created' })
    hospital_id: number;

}

