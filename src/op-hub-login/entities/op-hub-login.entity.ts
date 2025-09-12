import { ApiProperty } from "@nestjs/swagger";

export class Login {
    @ApiProperty({
        example: 'user@example.com',
        description: 'The username of the user attempting to log in.',
        required:true
      })
      Username: string;
    
      @ApiProperty({
        example: 'password123',
        description: 'The password of the user attempting to log in.',
        required:true
      })
      Password: string;
}
