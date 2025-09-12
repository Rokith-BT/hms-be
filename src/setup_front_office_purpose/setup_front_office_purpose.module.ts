import { Module } from '@nestjs/common';
import { SetupFrontOfficePurposeService } from './setup_front_office_purpose.service';
import { SetupFrontOfficePurposeController } from './setup_front_office_purpose.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupFrontOfficePurpose } from './entities/setup_front_office_purpose.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetupFrontOfficePurpose])],

  controllers: [SetupFrontOfficePurposeController],
  providers: [SetupFrontOfficePurposeService],
})
export class SetupFrontOfficePurposeModule {}
