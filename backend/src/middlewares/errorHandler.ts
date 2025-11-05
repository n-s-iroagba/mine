import { Request, Response, NextFunction } from 'express';
import { AppError, logger } from '../services/utils';



export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = error.message;
  let details: any = null;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    details = error.message;
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Resource already exists';
  } else if (error.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error
  if (statusCode >= 500) {
    logger.error('Server error:', {
      error: error,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn('Client error:', {
      error: error,
      statusCode,
      url: req.url,
      method: req.method,
    });
  }

  const response: any = {
    success: false,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };
  console.error(error)
  res.status(statusCode).json(response);
};