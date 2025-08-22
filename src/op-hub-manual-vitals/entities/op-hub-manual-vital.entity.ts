import { ApiProperty } from "@nestjs/swagger";
import { UpdateManualVitalDto } from "../dto/update-manual_vital.dto";

export class PostManualVital {
    @ApiProperty({
        description: 'Status of the response',
        example: 'success',
      })
      status: string;
    
      @ApiProperty({
        description: 'Message detailing the result of the operation',
        example: 'manual vitals updated successfully',
      })
      message: string;
}


export class getManualVital {
    @ApiProperty({
        description: 'Status of the response',
        example: 'success',
      })
      status: string;
    
      @ApiProperty({
        description: 'Message detailing the result of the operation',
        example: 'manual vitals fetched successfully',
      })
      message: string;

      @ApiProperty({
        description: 'fetched details of manual vitals will be displayed here',
        example: 'manual vitals fetched successfully',
      })
      details: UpdateManualVitalDto;
}