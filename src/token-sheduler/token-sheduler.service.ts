import { Injectable } from '@nestjs/common';
import * as cron from 'node-cron';
import { OpHubTokenInitiateService } from 'src/op-hub-token-initiate/op-hub-token-initiate.service';

@Injectable()
export class TokenShedulerService {
  constructor(private readonly tokenInitiateService: OpHubTokenInitiateService) {
  }

  scheduleTokenInitiation(): void {
    console.log("entering Function");
    cron.schedule('00 00 * * *', () => {
      console.log('Manually triggering task: Token initiation');
      this.tokenInitiateService.findAll().then(() => {
        console.log('Manually triggered task: Token initiation completed');
      }).catch(error => {
        console.error('Error occurred during manual task execution:', error);
      });
    });
  }
}
