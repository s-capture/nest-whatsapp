import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/role.guard';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '100000s' },
      }),
    }),
  ],
  providers: [AuthService, RolesGuard, JwtAuthGuard],
  exports: [],
})
export class SharedModule {}
