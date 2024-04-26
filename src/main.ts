import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common/enums/version-type.enum';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';
import * as express from 'express';
dotenv.config();
async function bootstrap() {
 
    const server = express();
    server.use('/public/uploads', express.static('public/uploads'));
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    await app.listen(3001);
  
}
bootstrap();
