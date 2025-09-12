import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [CertificatesController],
  providers: [CertificatesService,DynamicDatabaseService],
})
export class CertificatesModule {}
