import { Module } from '@nestjs/common';
import { ConsultationProcessListService } from './consultation-process-list.service';
import { ConsultationProcessListController } from './consultation-process-list.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { CryptoService } from 'src/qr-encrpyt/qr-encrpyt.service';

@Module({
  controllers: [ConsultationProcessListController],
  providers: [
    ConsultationProcessListService,
    DynamicDatabaseService,
    CryptoService,
  ],
})
export class ConsultationProcessListModule {}
