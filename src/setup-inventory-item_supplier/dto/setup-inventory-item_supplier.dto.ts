import { ApiProperty } from '@nestjs/swagger';
 
export class ItemSupplierDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'inventory supplier' })
  item_supplier: string;

  @ApiProperty({ example: 9879879875 })
  phone: number;


  @ApiProperty({ example: 'abc@gmail.com' })
  email: string;

  @ApiProperty({ example: 'chennai' })
  address: string;
 
  @ApiProperty({ example: 'raja' })
  contact_person_name: string;
 
  @ApiProperty({ example: 7531598574 })
  contact_person_phone: number;

  @ApiProperty({ example: 'bca@gmail.com' })
  contact_person_email: string;

  @ApiProperty({ example: 'none' })
  description: string;

  @ApiProperty({ example: '2025-05-14' })
  created_at: Date;

  @ApiProperty({ example: 1 })
  hospital_item_supplier_id: number;

  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: ItemSupplierDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}