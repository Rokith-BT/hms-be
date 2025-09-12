import { Module } from '@nestjs/common';
import { InternalModulesChargesnameAndIdService } from './internal_modules_chargesname-and-id.service';
import { InternalModulesChargesnameAndIdController } from './internal_modules_chargesname-and-id.controller';

@Module({
  controllers: [InternalModulesChargesnameAndIdController],
  providers: [InternalModulesChargesnameAndIdService],
})
export class InternalModulesChargesnameAndIdModule { }
