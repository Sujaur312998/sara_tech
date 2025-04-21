import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MethodNotAllowedMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, path } = req;

    const routeMethods: Record<string, string[]> = {
      '/users': ['GET', 'POST'],
    };

    const allowed = routeMethods[path];

    if (allowed && !allowed.includes(method)) {
      res.status(405).json({
        statusCode: 405,
        error: 'Method Not Allowed',
        message: `Method ${method} not allowed for ${path}`,
      });
    } else {
      next();
    }
  }
}
