import { Module } from '@nestjs/common';
import { PrintSettingService } from './print_setting.service';
import { PrintSettingController } from './print_setting.controller';


@Module({
  controllers: [PrintSettingController],
  providers: [PrintSettingService],
})
export class PrintSettingModule {}


