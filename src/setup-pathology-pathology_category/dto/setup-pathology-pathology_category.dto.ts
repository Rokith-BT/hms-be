import { ApiProperty } from '@nestjs/swagger';
 
export class PathologyCategoryDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'patho category' })
  category_name: string;

  @ApiProperty({ example: '2025-05-08' })
  created_at: Date;
 
  @ApiProperty({ example: 1 })
  Hospital_id: number;
 
  @ApiProperty({ example: 1 })
  hospital_pathology_category_id: number;
 
}
 
export class CountDto {
    @ApiProperty({ example: '10' })
    details: PathologyCategoryDto[];
 
    @ApiProperty({ example: '10' })
    total: number;
 
}