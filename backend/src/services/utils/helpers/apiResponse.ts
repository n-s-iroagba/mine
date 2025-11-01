import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ResponseHelper {
  static success<T>(
    res: Response,
    message: string = 'Success',
    data?: T,
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      ...(data && { data }),
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    message: string = 'Resource created successfully',
    data?: T
  ): Response {
    return this.success(res, message, data, 201);
  }

  static paginated<T>(
    res: Response,
    message: string,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  ): Response {
    const response: ApiResponse<T[]> = {
      success: true,
      message,
      data,
      pagination,
    };

    return res.status(200).json(response);
  }

  static error(
    res: Response,
    message: string = 'Internal server error',
    statusCode: number = 500
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
    };

    return res.status(statusCode).json(response);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}