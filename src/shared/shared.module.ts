import { MailerModule } from '@nestjs-modules/mailer';
import { forwardRef, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth/auth.service';
import { MailService } from './auth/mail.service';
import { JwtAuthGuard } from './guards/auth.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
@Global()
@Module({
  imports: [
    // PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '100000s' },
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: parseInt(configService.get('MAIL_PORT')),
          secure: configService.get('MAIL_SECURE') === 'true',
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"${configService.get('MAIL_FROM')}" <${configService.get('SUPPORT_EMAIL')}>`,
        },
      }),
    }),
    forwardRef(() => UserModule),
  ],

  providers: [
    AuthService,
    MailService,

    GoogleStrategy,
    JwtAuthGuard,
    JwtService,
    JwtStrategy,
  ],
  exports: [AuthService, MailService, JwtService],
})
export class SharedModule {}
