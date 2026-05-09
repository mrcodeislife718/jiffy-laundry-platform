import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

export class ValidationError extends Error {
  status = 400;
  code = 'VALIDATION_ERROR';
  details: any;

  constructor(message: string, details?: any) {
    super(message);
    this.details = details;
  }
}

export class NotFoundError extends Error {
  status = 404;
  code = 'NOT_FOUND';

  constructor(message: string = 'Resource not found') {
    super(message);
  }
}

export class UnauthorizedError extends Error {
  status = 401;
  code = 'UNAUTHORIZED';

  constructor(message: string = 'Unauthorized') {
    super(message);
  }
}

export class ForbiddenError extends Error {
  status = 403;
  code = 'FORBIDDEN';

  constructor(message: string = 'Forbidden') {
    super(message);
  }
}

export class ConflictError extends Error {
  status = 409;
  code = 'CONFLICT';

  constructor(message: string = 'Resource conflict') {
    super(message);
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors,
    });
  }

  // Custom API errors
  if (err instanceof Error && (err as ApiError).status) {
    const apiErr = err as ApiError;
    return res.status(apiErr.status || 500).json({
      success: false,
      error: err.message,
      code: apiErr.code,
      ...(apiErr.code === 'VALIDATION_ERROR' && { details: (err as ValidationError).details }),
    });
  }

  // Supabase errors
  if (err.code && err.message) {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: err.code,
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
