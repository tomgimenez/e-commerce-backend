import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { S3Module } from '../s3/s3.module';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [
    ConfigModule,
    S3Module
  ]
})
export class FilesModule {}
