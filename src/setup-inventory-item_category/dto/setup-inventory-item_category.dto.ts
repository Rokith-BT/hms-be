import { ApiProperty } from '@nestjs/swagger';
 
export class ItemCategoryDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'inventory category' })
  item_category: string;

  @ApiProperty({ example: 'yes' })
  is_active: string;


  @ApiProperty({ example: 'none' })
  description: string;

  @ApiProperty({ example: '2025-05-08' })
  created_at: Date;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_item_category_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: ItemCategoryDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}