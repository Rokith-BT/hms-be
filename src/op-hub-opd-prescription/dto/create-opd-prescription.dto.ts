import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum FilledUsingEnum {
  VOICE = 'voice',
  SCRIBBLE = 'scribble',
  TEXT = 'text',
}

export class CreateOpdPrescriptionDto {
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

  @ApiPropertyOptional({ example: '10', description: 'Quantity of the medicine' })
  quantity?: string;

  @ApiPropertyOptional({ example: 'before meal', description: 'When to take the medicine' })
  when?: string;

  @ApiPropertyOptional({ example: 'Take with water', description: 'Remarks or additional instructions' })
  remarks?: string;

  @ApiProperty({ example: 'voice', description: 'Method used to fill the prescription', enum: FilledUsingEnum })
  @IsEnum(FilledUsingEnum, { message: 'filled_using must be one of: voice, scribble, text' })
  filled_using: FilledUsingEnum;

  @ApiProperty({ example: 1, description: 'Outpatient department (OPD) ID' })
  opd_id: number;

  @ApiProperty({ example: 1, description: 'Hospital ID where the prescription was created' })
  hospital_id: number;
}

export class CreateOpdPrescriptionRequestDto {
  @ApiProperty({
    type: [CreateOpdPrescriptionDto],
    description: 'Array of prescriptions or a single prescription',
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateOpdPrescriptionDto)
  prescriptions: CreateOpdPrescriptionDto[];
}
