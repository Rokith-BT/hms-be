import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import {
  RekognitionClient,
  IndexFacesCommand,
  Attribute,
  SearchFacesByImageCommand,
} from '@aws-sdk/client-rekognition';
import * as path from 'path';
import { awsConfig } from 'src/aws.config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class FaceAuthService {
  private readonly s3: S3Client;
  private readonly rekognition: RekognitionClient;
  private readonly S3_BUCKET = 'ophub-face-auth-bucket';
  private readonly COLLECTION_ID = 'my-face-collection';

  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {
    this.s3 = new S3Client({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });

    this.rekognition = new RekognitionClient({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });
  }

  async uploadAndIndexFace(file: Express.Multer.File) {
    const fileContent = file.buffer;
    const fileName = `${file.originalname}_${Date.now()}`;

    const s3Params = {
      Bucket: this.S3_BUCKET,
      Key: fileName,
      Body: fileContent,
      ContentType: file.mimetype,
    };

    await this.s3.send(new PutObjectCommand(s3Params));

    const indexParams = {
      CollectionId: this.COLLECTION_ID,
      Image: {
        S3Object: {
          Bucket: this.S3_BUCKET,
          Name: fileName,
        },
      },
      ExternalImageId: path.parse(fileName).name,
      DetectionAttributes: [Attribute.ALL], // or use Attribute.DEFAULT if needed
    };

    const indexCommand = new IndexFacesCommand(indexParams);
    const indexResult = await this.rekognition.send(indexCommand);

    const faces = indexResult.FaceRecords ?? [];

    if (faces.length > 1) {
      return {
        status: 'failed',
        message:
          'Please provide a photo featuring only one individual and not a group photo.',
      };
    } else if (faces.length < 1) {
      return {
        status: 'failed',
        message: 'Invalid photo. Please upload a file with a human face.',
      };
    }

    const face = faces[0]?.FaceDetail;

    if (face?.Quality?.Brightness < 30) {
      return {
        status: 'failed',
        message: 'Invalid photo. Please upload a file with good brightness.',
      };
    }

    if (face?.Pose?.Yaw > 20 || face?.Pose?.Yaw < -35) {
      return {
        status: 'failed',
        message: 'Invalid photo. Please upload a photo with a straight face.',
      };
    }

    if (face?.Pose?.Pitch > 20 || face?.Pose?.Pitch < -20) {
      return {
        status: 'failed',
        message: 'Invalid photo. Please upload a photo with a straight face.',
      };
    }

    if (face?.Pose?.Roll > 10 || face?.Pose?.Roll < -20) {
      return {
        status: 'failed',
        message: 'Invalid photo. Please upload a photo with a straight face.',
      };
    }
    // let faceId = indexResult.FaceRecords[0].Face?.FaceId
    return {
      message: 'Face indexed successfully!',
      faceId: indexResult.FaceRecords[0].Face?.FaceId,
      key: fileName,
    };
  }

  async searchFace(file: Express.Multer.File) {
    const fileContent = file.buffer;
    const fileName = path.basename(file.originalname);

    const s3Params = {
      Bucket: this.S3_BUCKET,
      Key: fileName,
      Body: fileContent,
      ContentType: file.mimetype,
    };

    await this.s3.send(new PutObjectCommand(s3Params));

    const searchParams = {
      CollectionId: this.COLLECTION_ID,
      Image: {
        S3Object: {
          Bucket: this.S3_BUCKET,
          Name: fileName,
        },
      },
      FaceMatchThreshold: 90,
      MaxFaces: 1,
    };

    try {
      const searchCommand = new SearchFacesByImageCommand(searchParams);
      const result = await this.rekognition.send(searchCommand);

      if (result.FaceMatches && result.FaceMatches.length > 0) {
        const getPatDetails = await this.dynamicConnection.query(
          `select * from patients where faceId = ?`,
          [result.FaceMatches[0].Face.FaceId],
        );
        return {
          message: 'Face matched!',
          patientDetails: getPatDetails,
        };
      } else {
        return { message: 'No matching face found.' };
      }
    } catch (error) {
      console.error(error);
      return { message: 'Face match failed', error };
    }
  }

  async getfaceID(key: string) {
    const searchParams = {
      CollectionId: this.COLLECTION_ID,
      Image: {
        S3Object: {
          Bucket: this.S3_BUCKET,
          Name: key,
        },
      },
      FaceMatchThreshold: 90,
      MaxFaces: 1,
    };

    try {
      const searchCommand = new SearchFacesByImageCommand(searchParams);
      const result = await this.rekognition.send(searchCommand);

      if (result.FaceMatches.length > 0) {
        return {
          faceID: result.FaceMatches[0].Face.FaceId,
          message: 'Data fetched successfully',
        };
      } else {
        return {
          message: 'No data found.',
        };
      }
    } catch (error) {
      console.error(error);
      return {
        message: 'Face match failed',
        error,
      };
    }
  }
}
