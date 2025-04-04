import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../user/model/user.entity';
import { UserService } from '../../user/user.service';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: UserEntity) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      organizationId: user.organization?.id,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION'),
      }),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION'),
      }),
    };
  }

  async refreshToken(user: UserEntity) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      organizationId: user.organization?.id,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION'),
      }),
    };
  }

  async googleLogin(req) {
    if (!req.user) {
      throw new BadRequestException('No user from Google');
    }
    console.log(req);
    const { googleId, displayName, firstName, lastName, email, avatar } =
      req.user;

    let user = await this.userService.findByEmail(req.user.email);

    if (!user) {
      // Create new user
      user = await this.userService.createFromOAuth({
        email,
        googleId,
        name: displayName,
        avatar: avatar,
        password: bcrypt.hashSync(Math.random().toString(36).slice(-8), 10),
        firstName: firstName,
        lastName: lastName,
      });
    }

    if (!user.googleId) {
      user = await this.userService.updateGoogleId(user.id, {
        googleId,
        name: displayName,
        avatar: avatar,
        firstName: firstName,
        lastName: lastName,
      });
    }
    console.log(user, 'user');
    return this.login(user);
  }
}
