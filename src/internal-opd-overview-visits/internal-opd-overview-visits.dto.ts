import { ApiProperty } from '@nestjs/swagger';

export class overview_visits_Dto1 {



}

export class CountDto {
    @ApiProperty({ example: '10' })
    details: overview_visits_Dto1[];

    @ApiProperty({ example: '10' })
    total: number;

    @ApiProperty({ example: '10' })
    limit: number;

    @ApiProperty({ example: '1' })
    page: number;
}