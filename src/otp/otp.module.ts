import { Module } from '@nestjs/common';
import { Msg91Service } from './otp.service';
import { OTPController } from './otp.controller';
// import { OtpService } from './otp.service';
// import { OtpController } from './otp.controller';

@Module({
  controllers: [OTPController],
  providers: [Msg91Service],
})
export class OtpModule {}
