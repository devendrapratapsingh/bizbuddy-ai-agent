import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { userId: string };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Skip authentication for public routes
    const publicRoutes = ['/api/auth/register', '/api/auth/login'];
    const isPublicRoute = publicRoutes.some(route => req.path.startsWith(route));

    if (isPublicRoute) {
      return next();
    }

    // Get token from header, query, or body
    const token = req.header('Authorization')?.replace('Bearer ', '') ||
                  (req.query.token as string) ||
                  (req.body as any)?.token;

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JwtPayload;

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    // Attach user to request
    req.user = decoded as JwtPayload & { userId: string };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export const socketAuthMiddleware = (socket: any, next: any) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

    if (!decoded || !decoded.userId) {
      return next(new Error('Invalid token'));
    }

    socket.user = decoded;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
};