import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
// Add this at the very top of app.module.ts
import * as crypto from 'crypto';
import { AppService } from './app.service';
import { OrganizationModule } from './organization/organization.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';
globalThis.crypto = crypto as any;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('POSTGRES'),
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
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
    SharedModule,
    OrganizationModule,
    UserModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
