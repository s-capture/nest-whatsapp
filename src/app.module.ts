import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from './app-config.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AwsS3Service } from './shared/common/aws-s3.service';
import { AwsS3Store } from './shared/common/s3-store';
import { WhatsappController } from './whatsapp/whatsapp.controller';
import { WhatsappModule } from './whatsapp/whatsapp.module';
// Add this at the very top of app.module.ts
import * as crypto from 'crypto';
import { SharedModule } from './shared/shared.module';
globalThis.crypto = crypto as any;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        timezone: configService.get('TZ'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true,
        sslmode: 'require',
        ssl: true,
        keepConnectionAlive: true,
      }),

      inject: [ConfigService],
    }),
    WhatsappModule,
    SharedModule,
  ],

  controllers: [AppController, WhatsappController],
  providers: [AppConfigService, AppService, AwsS3Service, AwsS3Store],
  exports: [AppConfigService],
})
export class AppModule {}
