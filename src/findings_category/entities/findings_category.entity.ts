// import { ApiProperty } from "@nestjs/swagger";

// export class FindingsCategory {
//     @ApiProperty({ example: 194, description: 'The unique ID of the record' })
//     id:number;

//     category:string;
//     created_at:Date;
//     hospital_finding_category_id:number;
//     Hospital_id:number;
// }


import { ApiProperty } from "@nestjs/swagger";

export class FindingsCategory {

    @ApiProperty({
        example: 194,
        description: 'The unique identifier for the findings category record.'
    })
    id: number;

    @ApiProperty({
        example: 'Radiology',
        description: 'The name or category type for the finding, e.g., Radiology, Pathology, etc.'
    })
    category: string;

    @ApiProperty({
        example: '2023-11-09T12:34:56.000Z',
        description: 'The timestamp for when the record was created.'
    })
    created_at: Date;

    @ApiProperty({
        example: 45,
        description: 'The identifier for the specific hospital finding category associated with this record.'
    })
    hospital_finding_category_id: number;

    @ApiProperty({
        example: 7,
        description: 'The identifier for the hospital associated with this finding category.'
    })
    Hospital_id: number;
}

export class findingaa {
    @ApiProperty({ example: 'new_findi1' })
    category: string;

    @ApiProperty({ example: 1 })
    Hospital_id: number
}