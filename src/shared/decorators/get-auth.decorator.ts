import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthEntity } from 'src/auth/model/auth.entity';

export const GetAuth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthEntity => {
    const request = ctx.switchToHttp().getRequest();
    return request.auth;
  },
);
