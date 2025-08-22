import { ApiProperty } from '@nestjs/swagger';

export class CreateOverallHeaderSearchDto {
    @ApiProperty({
        description: 'Search term or criteria',
        type: 'string', 
        example: 7092327667
    })
    search: any;

    @ApiProperty({
        description: 'The module in which the search is performed',
        type: 'string',
        example: 'patients'
    })
    module: string;
    @ApiProperty({
        description: 'The module in which the search is performed',
        type: 'string',
        example: 1
    })
    hospital_id: number;
}
