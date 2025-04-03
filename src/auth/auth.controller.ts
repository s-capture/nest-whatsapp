import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { GetAuth } from 'src/shared/decorators/get-auth.decorator';
import { JwtAuthGuard } from 'src/shared/guards/auth.guard';
import { AuthService } from './auth.service';
import {
  CompleteRegistrationDto,
  InviteStaffDto,
  LoginDto,
  RegisterDto,
} from './model/auth.dto';
import { AuthEntity } from './model/auth.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleLogin(req);

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`,
    );
  }

  // @Post('refresh')
  // async refreshTokens(@Body() body: { refreshToken: string }) {
  //   const { refreshToken } = body;
  //   const payload = this.authService.jwtService.verify(refreshToken);
  //   return this.authService.refreshTokens(payload.authId, refreshToken);
  // }

  @Post('invite')
  @UseGuards(JwtAuthGuard)
  async inviteStaff(
    @GetAuth() auth: AuthEntity,
    @Body() inviteStaffDto: InviteStaffDto,
  ) {
    return this.authService.inviteStaff(auth, inviteStaffDto);
  }

  @Post('complete-registration')
  async completeRegistration(
    @Body() completeRegistrationDto: CompleteRegistrationDto,
  ) {
    return this.authService.completeRegistration(completeRegistrationDto);
  }

  // @Get('validate-invite')
  // async validateInvite(@Query('token') token: string) {
  //   try {
  //     const payload = this.authService.jwtService.verify(token);
  //     return { valid: true, email: payload.email };
  //   } catch (e) {
  //     return { valid: false };
  //   }
  // }
}
