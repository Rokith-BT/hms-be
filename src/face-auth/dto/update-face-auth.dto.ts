import { PartialType } from '@nestjs/swagger';
import { CreateFaceAuthDto } from './create-face-auth.dto';

export class UpdateFaceAuthDto extends PartialType(CreateFaceAuthDto) {}
