// aws.config.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class AwsConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
}


export const awsConfig: AwsConfig = {
  accessKeyId: 'AKIAYGPK65NCLK7N3S44',
  secretAccessKey: '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',
  region: 'ap-south-1',
  bucketName: 'ophub-dev-bucket',
};