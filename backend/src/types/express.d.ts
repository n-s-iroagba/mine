import 'express';

declare global {
  namespace Express {
    interface UserPayload {
      userId: number;
      role: string;
      [key: string]: any;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}
