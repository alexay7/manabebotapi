import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { LogSchema } from 'src/schemas/log.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    MongooseModule.forFeature([{ name: 'Log', schema: LogSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
