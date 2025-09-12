import { Module } from '@nestjs/common';
import { OpHubLoginService } from './op-hub-login.service';
import { OpHubLoginController } from './op-hub-login.controller';

@Module({
  controllers: [OpHubLoginController],
  providers: [OpHubLoginService],
})
export class OpHubLoginModule {}
