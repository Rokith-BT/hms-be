

import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FaceAuthService } from './face-auth.service';
import { awsConfig } from 'src/aws.config';
import { S3, GetObjectCommand } from '@aws-sdk/client-s3';


@Controller('face')
export class FaceController {
  constructor(private readonly faceService: FaceAuthService) { }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor("file"),
  )
  async uploadFace(@UploadedFile() file: Express.Multer.File,
  ) {
    console.log(1213, file);

    if (!file) {
      throw new HttpException('No image uploaded', HttpStatus.BAD_REQUEST);
    }


    try {
      const result = await this.faceService.uploadAndIndexFace(file);
      return result;
    } catch (error) {
      console.log(error, "error");

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('search')
  @UseInterceptors(
    FileInterceptor("file"),
  )
  async searchFace(@UploadedFile() file: Express.Multer.File) {
    try {

      const result = await this.faceService.searchFace(file);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('get-faceid')
  async FaceId(@Body('key') key: string) {
    try {

      const result = await this.faceService.getfaceID(key);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('getImage')
  async getDocs(@Body('key') key: string) {
    try {
      const s3 = new S3({
        credentials: {
          accessKeyId: awsConfig.accessKeyId,
          secretAccessKey: awsConfig.secretAccessKey,
        },
        region: awsConfig.region,
      });
      const command = new GetObjectCommand({
        Bucket: 'ophub-face-auth-bucket',
        Key: key,
      });      
      const s3Data = await s3.send(command);
      const buffer = Buffer.from(await s3Data.Body.transformToByteArray());
      return buffer.toString('base64');
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}