import { ApiProperty } from '@nestjs/swagger';

export class IpdTreatmentHitoryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'fever' })
  symptoms: string;

  @ApiProperty({ example: 'ragu' })
  name: string;

  @ApiProperty({ example: 'ram' })
  surname: string;

  @ApiProperty({ example: 'PLE001' })
  employee_id: string;
}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: IpdTreatmentHitoryDto[];

  @ApiProperty({ example: '10' })
  total: number;
}
