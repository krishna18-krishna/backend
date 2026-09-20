import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export const notFound: RequestHandler = (_request, response) => {
  response.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) return response.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message ?? 'Invalid request' } });
  if (error instanceof HttpError) return response.status(error.status).json({ success: false, error: { code: error.code, message: error.message } });
  console.error(error);
  return response.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
};
