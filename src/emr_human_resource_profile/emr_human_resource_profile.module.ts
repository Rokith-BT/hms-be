import { Module } from '@nestjs/common';
import { EmrHumanResourceProfileService } from './emr_human_resource_profile.service';
import { EmrHumanResourceProfileController } from './emr_human_resource_profile.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmrHumanResourceProfile } from './entities/emr_human_resource_profile.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([EmrHumanResourceProfile])],

  controllers: [EmrHumanResourceProfileController],
  providers: [EmrHumanResourceProfileService,DynamicDatabaseService],
})
export class EmrHumanResourceProfileModule {}
