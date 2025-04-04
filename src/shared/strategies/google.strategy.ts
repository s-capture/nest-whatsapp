import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile', 'openid'], // Added openid scope
      accessType: 'offline', // Recommended for refresh tokens
      prompt: 'consent', // Ensures you get a refresh token
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any) => void,
  ) {
    const { id, displayName, name, emails, photos } = profile;

    const user = {
      googleId: id,
      email: emails?.[0]?.value,
      firstName: name?.givenName || displayName?.split(' ')[0] || '',
      lastName:
        name?.familyName || displayName?.split(' ').slice(1).join(' ') || '',
      displayName,
      avatar: photos?.[0]?.value,
      accessToken,
    };

    done(null, user);
  }
}
