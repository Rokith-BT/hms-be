import { ApiProperty } from '@nestjs/swagger';
 
export class ItemStoreDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'inventory store' })
  item_store: string;

  @ApiProperty({ example: '001' })
  code: string;


  @ApiProperty({ example: 'none' })
  description: string;

  @ApiProperty({ example: '2025-05-08' })
  created_at: Date;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_item_store_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: ItemStoreDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}