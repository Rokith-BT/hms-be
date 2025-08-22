import { Module } from '@nestjs/common';
import { EmrNewLoginController } from './emr_new-login.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { EmrNewLoginService } from './emr_new-login.service';

@Module({
  controllers: [EmrNewLoginController],
  providers: [EmrNewLoginService,DynamicDatabaseService],
})
export class EmrNewLoginModule {}
