
import { ApiProperty } from '@nestjs/swagger';

export class CreatePreviewDocDto 

 {
  @ApiProperty({
    description: 'Content of the appointment',
    example: 'Preview',
  })
  preview_slide: string;
}
