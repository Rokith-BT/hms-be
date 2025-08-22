import { ApiProperty } from '@nestjs/swagger';

export class pharmacy_supplier1 {
  @ApiProperty({ example: 'deva' })
  supplier: string;

  @ApiProperty({ example: '8787878787' })
  contact: number;

  @ApiProperty({ example: 'raju' })
  supplier_person: string;

  @ApiProperty({ example: '9987878722' })
  supplier_person_contact: number;

  @ApiProperty({ example: '9987878722' })
  supplier_drug_licence: string;

  @ApiProperty({ example: 'theni' })
  address: string;

  @ApiProperty({ example: 1 })
  Hospital_id: number;





}

export class CountDto {
  @ApiProperty({ example: '10' })
  details: pharmacy_supplier1[];

  @ApiProperty({ example: '10' })
  total: number;

}