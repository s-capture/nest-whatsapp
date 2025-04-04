import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponseInterceptor } from 'src/shared/interceptors/serialize.interceptor';
import { UserDecorator } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { UpdateUserDto } from './model/user.dto';
import { UserEntity } from './model/user.entity';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @UseInterceptors(
    new SuccessResponseInterceptor({
      message: 'User data is  successfully retrevied ',
    }),
  )
  async getProfile(@UserDecorator() user: UserEntity) {
    return this.userService.findById(user.id);
  }

  @Patch('me')
  updateProfile(
    @UserDecorator() user: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(user.id, updateUserDto);
  }
}
