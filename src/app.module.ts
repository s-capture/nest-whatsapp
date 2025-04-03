import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from './app-config.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AwsS3Service } from './shared/common/aws-s3.service';
import { AwsS3Store } from './shared/common/s3-store';
import { WhatsappController } from './whatsapp/whatsapp.controller';
// Add this at the very top of app.module.ts
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as crypto from 'crypto';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { OrganizationController } from './organization/organization.controller';
import { OrganizationModule } from './organization/organization.module';
import { SharedModule } from './shared/shared.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
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
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    SharedModule,
    AuthModule,
    OrganizationModule,
    UserModule,
    WhatsappModule,
  ],

  controllers: [
    AppController,
    AuthController,
    UserController,
    OrganizationController,
    WhatsappController,
  ],
  providers: [AppConfigService, AppService, AwsS3Service, AwsS3Store],
  exports: [AppConfigService],
})
export class AppModule {}
