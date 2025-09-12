import { Module } from '@nestjs/common';
import { OpdBillingService } from './opd_billing.service';
import { OpdBillingController } from './opd_billing.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { FaceAuthService } from 'src/face-auth/face-auth.service';



@Module({
  controllers: [OpdBillingController],
  providers: [OpdBillingService,DynamicDatabaseService,FaceAuthService],
})
export class OpdBillingModule {}
