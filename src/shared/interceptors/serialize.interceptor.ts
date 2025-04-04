// shared/interceptors/success-response.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface SuccessResponseOptions {
  message?: string;
  pagination?: boolean;
}

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
  constructor(private options?: SuccessResponseOptions) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    return next.handle().pipe(
      map((data) => {
        // Skip if already formatted
        if (data?.statusCode) return data;

        // Handle paginated responses
        if (this.options?.pagination && data?.items) {
          return {
            statusCode: response.statusCode,
            message: this.options.message || 'Data retrieved successfully',
            data: data.items,
            meta: {
              total: data.total,
              page: data.page,
              limit: data.limit,
              totalPages: Math.ceil(data.total / data.limit),
            },
            timestamp: new Date().toISOString(),
            path: request.url,
            success: true,
          };
        }

        // Standard response
        return {
          statusCode: response.statusCode,
          message: this.options?.message || 'Request successful',
          data: data,
          timestamp: new Date().toISOString(),
          path: request.url,
          success: true,
        };
      }),
    );
  }
}
