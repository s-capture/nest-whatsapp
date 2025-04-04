// shared/interceptors/error-response.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      catchError((error) => {
        // Handle NestJS HTTP exceptions
        if (error.getStatus && error.getResponse) {
          const status = error.getStatus();
          const errorResponse = error.getResponse();

          return throwError(() => ({
            statusCode: status,
            message: errorResponse.message || errorResponse,
            error: error.name || 'HttpException',
            timestamp: new Date().toISOString(),
            path: request.url,
            details: errorResponse.details || undefined,
          }));
        }

        // Handle generic errors
        return throwError(() => ({
          statusCode: response.statusCode >= 400 ? response.statusCode : 500,
          message: error.message || 'Internal server error',
          error: error.name || 'Error',
          timestamp: new Date().toISOString(),
          path: request.url,
          details:
            process.env.NODE_ENV === 'development' ? error.stack : undefined,
        }));
      }),
    );
  }
}
