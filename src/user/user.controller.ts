import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../shared/auth/auth.service';
import { UserDecorator } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RefreshGuard } from '../shared/guards/refresh.guard';
import {
  CreateUserDto,
  InvitedUserDto,
  LoginUserDto,
  UpdateUserDto,
} from './model/user.dto';
import { UserEntity } from './model/user.entity';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return this.authService.login(user);
  }

  @Post('register/invited')
  async registerInvited(@Body() invitedUserDto: InvitedUserDto) {
    const user = await this.userService.createInvitedUser(invitedUserDto);
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

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@UserDecorator() user: UserEntity) {
    return this.userService.findById(user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @UserDecorator() user: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(user.id, updateUserDto);
  }

  @Post('refresh')
  @UseGuards(RefreshGuard)
  refreshToken(@UserDecorator() user: UserEntity) {
    return this.authService.refreshToken(user);
  }

  @Get('google')
  @UseGuards(JwtAuthGuard)
  googleAuth() {
    // Handled by GoogleStrategy
  }

  @Get('google/callback')
  @UseGuards(JwtAuthGuard)
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }
}
