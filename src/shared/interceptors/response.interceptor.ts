import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    const next = {};
    for (const [key, item] of Object.entries(value)) {
      if (key === 'passwordHash') continue;
      next[key] = sanitize(item);
    }
    return next;
  }
  return value;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const clean = sanitize(data);
        if (clean && clean.__raw) return clean.data;
        return {
          success: true,
          timestamp: new Date().toISOString(),
          data: clean,
        };
      }),
    );
  }
}
