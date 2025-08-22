import { ApiProperty } from '@nestjs/swagger';
 
export class PayslipSettingsDto {

  @ApiProperty({ example: 1 })
  payslip_category_id: number;
 
  @ApiProperty({ example: 'Basic' })
  payslip_setting_name: string;

  @ApiProperty({ example: '100' })
  default_amount: string;

  @ApiProperty({ example: '10' })
  default_percentage: string;
 
  @ApiProperty({ example: '2025-04-02' })
  created_at: Date;
 
  @ApiProperty({ example: 1 })
  hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hos_payslip_settings_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: PayslipSettingsDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}