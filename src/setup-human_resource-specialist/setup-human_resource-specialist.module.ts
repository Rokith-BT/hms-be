import { Module } from '@nestjs/common';
import { SetupHumanResourceSpecialistService } from './setup-human_resource-specialist.service';
import { SetupHumanResourceSpecialistController } from './setup-human_resource-specialist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupHumanResourceSpecialist } from './entities/setup-human_resource-specialist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetupHumanResourceSpecialist])],

  controllers: [SetupHumanResourceSpecialistController],
  providers: [SetupHumanResourceSpecialistService],
})
export class SetupHumanResourceSpecialistModule { }
