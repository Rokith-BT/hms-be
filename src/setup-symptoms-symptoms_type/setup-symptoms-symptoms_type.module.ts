import { Module } from '@nestjs/common';
import { SetupSymptomsSymptomsTypeService } from './setup-symptoms-symptoms_type.service';
import { SetupSymptomsSymptomsTypeController } from './setup-symptoms-symptoms_type.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupSymptomsSymptomsType } from './entities/setup-symptoms-symptoms_type.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([SetupSymptomsSymptomsType])],

  controllers: [SetupSymptomsSymptomsTypeController],
  providers: [SetupSymptomsSymptomsTypeService,DynamicDatabaseService],
})
export class SetupSymptomsSymptomsTypeModule {}
