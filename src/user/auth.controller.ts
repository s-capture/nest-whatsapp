import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import {
  InvalidOAuthProfileException,
  OAuthException,
} from 'src/shared/exceptions/oauth.exception';
import { AuthService } from '../shared/auth/auth.service';
import { UserDecorator } from '../shared/decorators/user.decorator';
import { RefreshGuard } from '../shared/guards/refresh.guard';
import { CreateUserDto, LoginUserDto } from './model/user.dto';
import { UserEntity } from './model/user.entity';
import { UserService } from './user.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  private getFrontendUrl(path = '') {
    const baseUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    return new URL(path, baseUrl).toString();
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);

    return this.authService.login(user);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.authService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('refresh')
  @UseGuards(RefreshGuard)
  refreshToken(@UserDecorator() user: UserEntity) {
    return this.authService.refreshToken(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    //
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const errorRedirect = this.getFrontendUrl('/login');
    const successRedirect = this.getFrontendUrl('/oauth-callback');

    try {
      if (!req.user) {
        throw new InvalidOAuthProfileException(errorRedirect, 'user profile');
      }

      const { access_token, refresh_token } =
        await this.authService.googleLogin(req);

      return res.redirect(
        `${successRedirect}?token=${access_token}&refresh_token=${refresh_token}`,
      );
    } catch (error) {
      // Let the exception filter handle it
      throw new OAuthException(
        error.message || 'OAuth authentication failed',
        errorRedirect,
      );
    }
  }
}
