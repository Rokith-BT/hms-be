import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.success' });
dotenv.config({ path: '.env.error' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule); 
  app.enableCors(); 
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  }));
  const config = new DocumentBuilder()
                    .setTitle('HMS API DOCUMENTATION')
                    .setDescription('API SWAGGER DOCUMENTATION CREATED BY BACKEND DEVELOPERS')
                    .setVersion('v1')
                    .addTag(`hms-appointment`)
                    .build()
 
const document = SwaggerModule.createDocument(app,config)
SwaggerModule.setup('swagger-api/document',app,document)
   await app.listen(3102);

  console.log("connected","3102");


}
bootstrap();




