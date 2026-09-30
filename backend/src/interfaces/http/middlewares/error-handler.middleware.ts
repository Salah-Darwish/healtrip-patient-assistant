import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
  const isDev = process.env.NODE_ENV === 'development';

  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_SERVER_ERROR',
      details: err.details || (err.name === 'ZodError' ? err.errors : undefined),
      ...(isDev ? { stack: err.stack } : {}),
    },
    timestamp: new Date().toISOString(),
  });
}
