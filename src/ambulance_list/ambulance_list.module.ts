import { Module } from '@nestjs/common';
import { AmbulanceListService } from './ambulance_list.service';
import { AmbulanceListController } from './ambulance_list.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [AmbulanceListController],
  providers: [AmbulanceListService,DynamicDatabaseService],
})

