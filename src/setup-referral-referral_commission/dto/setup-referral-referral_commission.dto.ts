import { ApiProperty } from '@nestjs/swagger';
 
export class ReferralCommissionDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  referral_category_id: number;

  @ApiProperty({ example: 1 })
  referral_type_id: number;

  @ApiProperty({ example: '100.00' })
  commission: any;

  @ApiProperty({ example: 1 })
  is_active: number;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_referral_commission_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: ReferralCommissionDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}