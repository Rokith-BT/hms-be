import { Controller, Post, Body, } from '@nestjs/common';
import { OpHubUploadDocPreviewService } from './op-hub-upload-doc-preview.service';
import { S3, S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { awsConfig } from 'src/aws.config';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


@Controller('op-hub-upload-doc-preview')
export class OpHubUploadDocPreviewController {
  constructor(private readonly uploadDocPreviwService: OpHubUploadDocPreviewService) { }

  @Post()
  async create(@Body('dongri') dongri: string, @Body('opd_id') opd_id: any, @Body('hospital_id') hospital_id: any, @Body('abhaAddress') abhaAddress: any) {
    try {

      if (dongri) {
        return await this.uploadDocPreviwService.create(dongri, opd_id, hospital_id, abhaAddress)
          ;
      }
    } catch (error) {
      console.error(error);
      let response = {
        "status": "failed",
        "message": "file upload failed",
      };
      return response;
    }
  }

  @Post('/get')
  async findAll(@Body('value') value: any) {
    try {
      const s3 = new S3({
        credentials: {
          accessKeyId: awsConfig.accessKeyId,
          secretAccessKey: awsConfig.secretAccessKey,
        },
        region: awsConfig.region,
      });
      const command = new GetObjectCommand({
        Bucket: awsConfig.bucketName,
        Key: value,
      });
      const s3Data = await s3.send(command);
      const buffer = Buffer.from(await s3Data.Body.transformToByteArray());
      return buffer.toString('base64');
    } catch (error) {
      console.error(error);
      return error;
    }
  }
  @Post('/get-signed-url')
  async getUrl(@Body('value') value: any) {
    try {



      const s3Client = new S3Client({
        credentials: {
          accessKeyId: awsConfig.accessKeyId,
          secretAccessKey: awsConfig.secretAccessKey,
        },
        region: awsConfig.region,
      });
      const command = new GetObjectCommand({
        Bucket: awsConfig.bucketName,
        Key: value,
      });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return {
        "status": "success",
        "message": "Image url can be accessed for 1 hour",
        "imageURL": signedUrl
      };
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
