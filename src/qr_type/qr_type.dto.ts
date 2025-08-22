import { IsString } from 'class-validator';

export class CreateQrTypeDto {
  @IsString()
  text: string;
}
