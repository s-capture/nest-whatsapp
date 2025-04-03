import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';
import { OrganizationEntity } from 'src/organization/model/organization.entity';
import { OrganizationService } from 'src/organization/organization.service';
import { JwtAuthGuard } from 'src/shared/guards/auth.guard';
import { GoogleStrategy } from 'src/shared/strategies/google.strategy';
import { LocalStrategy } from 'src/shared/strategies/local.strategy';
import { UserEntity } from 'src/user/model/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailService } from './mail.service';
import { AuthEntity } from './model/auth.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthEntity, UserEntity, OrganizationEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    LocalStrategy,
    JwtService,
    UserService,
    OrganizationService,
    MailService,
    JwtAuthGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
