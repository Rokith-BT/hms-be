import { Module } from '@nestjs/common';
import { SmsNewsletterService } from './sms-newsletter.service';
import { SmsNewsletterController } from './sms-newsletter.controller';

@Module({
  controllers: [SmsNewsletterController],
  providers: [SmsNewsletterService],
})
export class SmsNewsletterModule {}
