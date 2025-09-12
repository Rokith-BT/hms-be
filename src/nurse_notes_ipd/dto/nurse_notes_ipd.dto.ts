import { ApiProperty } from '@nestjs/swagger';
 
export class NurseNotesIpdDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2025-04-17' })
  date: Date;

  @ApiProperty({ example: 1 })
  ipd_id: number;
 
  @ApiProperty({ example: 1 })
  staff_id: number;
 
  @ApiProperty({ example: 'none' })
  note: string;

  @ApiProperty({ example: 'none' })
  comment: string;

  @ApiProperty({ example: 1 })
  Hospital_id: number;

  @ApiProperty({ example: 1 })
  hos_nurse_note_id: number;
 
  @ApiProperty({ example: 1 })
  hos_nurse_notes_comment_id: number;

  @ApiProperty({ example: 1 })
  nurse_note_id: number;
 
  @ApiProperty({ example: 1 })
  comment_staffid: number;

  @ApiProperty({ example: 'none' })
  comment_staff: string;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: NurseNotesIpdDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}