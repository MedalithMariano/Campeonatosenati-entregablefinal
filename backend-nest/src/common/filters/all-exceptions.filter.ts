import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorBody {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload = this.buildPayload(exception, request, status, isHttp);

    this.log(exception, request, status);

    response.status(status).json(payload);
  }

  private buildPayload(
    exception: unknown,
    request: Request,
    status: number,
    isHttp: boolean,
  ): ErrorBody {
    const base: ErrorBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: 'Error interno del servidor',
    };

    if (isHttp) {
      const original = (exception as HttpException).getResponse();
      if (typeof original === 'string') {
        return { ...base, message: original };
      }
      const data = original as Record<string, unknown>;
      return {
        ...base,
        message: (data.message as string | string[]) ?? base.message,
        ...(typeof data.error === 'string' && { error: data.error }),
      };
    }

    // Errores no-HTTP (bugs internos): solo exponer detalle fuera de producción.
    if (
      process.env.NODE_ENV !== 'production' &&
      exception instanceof Error &&
      exception.message
    ) {
      return { ...base, message: exception.message };
    }
    return base;
  }

  private log(exception: unknown, request: Request, status: number): void {
    const summary = `${request.method} ${request.url} → ${status}`;
    const detail = this.describeException(exception);

    if (status >= 500) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(`${summary} | ${detail}`, stack);
    } else {
      this.logger.warn(`${summary} | ${detail}`);
    }
  }

  private describeException(exception: unknown): string {
    if (exception instanceof HttpException) {
      const original = exception.getResponse();
      if (typeof original === 'string') return original;
      const data = original as Record<string, unknown>;
      const message = data.message;
      if (Array.isArray(message)) return message.join(' · ');
      if (typeof message === 'string') return message;
      return exception.message;
    }
    if (exception instanceof Error) {
      return `${exception.name}: ${exception.message}`;
    }
    if (exception && typeof exception === 'object') {
      const obj = exception as Record<string, unknown>;
      const message = obj.message ?? obj.error ?? obj.error_description;
      if (typeof message === 'string') return message;
      try {
        return JSON.stringify(exception);
      } catch {
        return String(exception);
      }
    }
    return String(exception);
  }
}
