import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';

import { ProductModule } from './product/product.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { CategoryModule } from './category/category.module';
import { ProductTypesModule } from './product-type/product-type.module';
import { S3Module } from './s3/s3.module';
import { UserModule } from './user/user.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { AddressModule } from './address/address.module';
import { ShippingModule } from './shipping/shipping.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      ssl: process.env.STAGE === 'prod',
      extra: {
        ssl: process.env.STAGE === 'prod'
              ? { rejectUnauthorized: false }
              : null,
      },
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,      
      autoLoadEntities: true,
      synchronize: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'), 
    }),

    ProductModule,

    CommonModule,

    SeedModule,

    FilesModule,

    AuthModule,

    ChatbotModule,

    CategoryModule,

    ProductTypesModule,

    S3Module,

    UserModule,

    RabbitmqModule,

    NotificationsModule,

    CartModule,

    OrderModule,

    AddressModule,

    ShippingModule,

  ],
})
export class AppModule {}
