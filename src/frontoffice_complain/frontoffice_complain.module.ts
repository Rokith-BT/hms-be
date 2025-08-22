import { Module } from '@nestjs/common';
import { FrontofficeComplainService } from './frontoffice_complain.service';
import { FrontofficeComplainController } from './frontoffice_complain.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [FrontofficeComplainController],
  providers: [FrontofficeComplainService, DynamicDatabaseService],
})
export class FrontofficeComplainModule { }
