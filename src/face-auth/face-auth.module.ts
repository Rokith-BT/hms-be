import { Module } from '@nestjs/common';
import { FaceAuthService } from './face-auth.service';
import { FaceController } from './face-auth.controller';

@Module({
  controllers: [FaceController],
  providers: [FaceAuthService],
})
export class FaceAuthModule {}
