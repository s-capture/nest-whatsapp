// filters/oauth-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { OAuthException } from '../exceptions/oauth.exception';

@Catch(OAuthException)
export class OAuthExceptionFilter implements ExceptionFilter {
  catch(exception: OAuthException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.redirect(
      `${exception.redirectUrl}?error=${encodeURIComponent(exception.message)}`,
    );
  }
}
