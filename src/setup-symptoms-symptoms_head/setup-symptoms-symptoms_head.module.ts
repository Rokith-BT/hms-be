import { Module } from '@nestjs/common';
import { SetupSymptomsSymptomsHeadService } from './setup-symptoms-symptoms_head.service';
import { SetupSymptomsSymptomsHeadController } from './setup-symptoms-symptoms_head.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { SetupSymptomsSymptomsHead } from './entities/setup-symptoms-symptoms_head.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([SetupSymptomsSymptomsHead])],

  controllers: [SetupSymptomsSymptomsHeadController],
  providers: [SetupSymptomsSymptomsHeadService,DynamicDatabaseService],
})
export class SetupSymptomsSymptomsHeadModule {}
