import { ApiProperty } from '@nestjs/swagger';
 
export class ConsultantRegisterIpdDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  ipd_id: number;

  @ApiProperty({ example: '2025-04-17' })
  date: Date;
 
  @ApiProperty({ example: '2025-04-17' })
  ins_date: Date;

  @ApiProperty({ example: 'none' })
  instruction: string;

  @ApiProperty({ example: 1 })
  cons_doctor: number;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;

  @ApiProperty({ example: 1 })
  hos_consultant_register_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: ConsultantRegisterIpdDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}