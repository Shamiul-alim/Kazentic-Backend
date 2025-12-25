import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/src/app.module";
import * as dotenv from "dotenv";
import { NestExpressApplication } from '@nestjs/platform-express'; 
import { join } from 'path'; 
import * as express from 'express';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: true, credentials: true });

   app.use('/uploads', express.static(join(process.cwd(), 'public', 'uploads')));
  await app.listen(parseInt(process.env.PORT as string));
}
bootstrap();
