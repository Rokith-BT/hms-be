import { Module } from '@nestjs/common';
import { ReferralPersonService } from './referral_person.service';
import { ReferralPersonController } from './referral_person.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [ReferralPersonController],
  providers: [ReferralPersonService,DynamicDatabaseService],
})
export class ReferralPersonModule {}
