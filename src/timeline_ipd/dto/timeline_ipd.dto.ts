import { ApiProperty } from '@nestjs/swagger';
 
export class IpdTimelineDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  patient_id: number;

  @ApiProperty({ example: 'timeline' })
  title: string;
 
  @ApiProperty({ example: '2025-04-18' })
  timeline_date: Date;

  @ApiProperty({ example: 'none' })
  description: string;

  @ApiProperty({ example: 'new.pdf' })
  document: string;
 
  @ApiProperty({ example: 'none' })
  status: string;

  @ApiProperty({ example: '2025-04-18' })
  date: Date;

  @ApiProperty({ example: 'new' })
  generated_users_type: string;

  @ApiProperty({ example: 1 })
  generated_users_id: number;

  @ApiProperty({ example: 1 })
  hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_patient_timeline_id: number;

}
 
export class CountDto {

    @ApiProperty({ example: '10' })
    details: IpdTimelineDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}