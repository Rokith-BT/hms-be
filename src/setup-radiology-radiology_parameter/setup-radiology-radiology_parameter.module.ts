import { Module } from '@nestjs/common';
import { SetupRadiologyRadiologyParameterService } from './setup-radiology-radiology_parameter.service';
import { SetupRadiologyRadiologyParameterController } from './setup-radiology-radiology_parameter.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [SetupRadiologyRadiologyParameterController],
  providers: [SetupRadiologyRadiologyParameterService,DynamicDatabaseService],
})
export class SetupRadiologyRadiologyParameterModule {}
