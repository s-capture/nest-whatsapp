import { HttpException, HttpStatus } from '@nestjs/common';

// exceptions/oauth.exception.ts
export class OAuthException extends HttpException {
  constructor(message: string, redirectUrl: string) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    this.redirectUrl = redirectUrl;
  }
  public redirectUrl: string;
}

export class InvalidOAuthProfileException extends OAuthException {
  constructor(redirectUrl: string, field: string) {
    super(`Invalid OAuth profile: missing ${field}`, redirectUrl);
  }
}
