import { Module } from '@nestjs/common';
import { PostalReceiveDispatchService } from './postal_receive_dispatch.service';
import { PostalReceiveDispatchController } from './postal_receive_dispatch.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [PostalReceiveDispatchController],
  providers: [PostalReceiveDispatchService,DynamicDatabaseService],
})
export class PostalReceiveDispatchModule {}
