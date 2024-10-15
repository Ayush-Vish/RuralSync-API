import { Agent, Client, RequestWithUser, ServiceProvider } from '@org/db';
import { ApiError } from './utils';
import { verify } from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import multer from 'multer';

export const verifyJWT = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from either cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next(new ApiError('Access Token is required', 401));
    }

    // Verify token
    let decodedToken;
    try {
      decodedToken = verify(token, 'SOME_SECRET');
    } catch (err) {
      return next(new ApiError('Invalid or Expired Access Token', 401));
    }

    if (!decodedToken) {
      return next(new ApiError('Failed to verify token', 401));
    }

    // Retrieve role from decoded token
    const { role, id } = decodedToken;
    if (!role || !id) {
      return next(new ApiError('Token is missing role or ID', 401));
    }

    // Fetch user based on role and decoded token ID
    let user = null;
    switch (role) {
      case 'CLIENT':
        user = await Client.findById(id).select('-password -refreshToken');
        break;
      case 'AGENT':
        user = await Agent.findById(id).select('-password -refreshToken');
        break;
      case 'SERVICE_PROVIDER':
        user = await ServiceProvider.findById(id).select('-password -refreshToken');
        break;
      default:
        return next(new ApiError(`Invalid role: ${role}`, 403));
    }

    if (!user) {
      return next(new ApiError('User associated with token not found', 401));
    }

    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    // Attach user details to the request object
    req.user = {
      id: user.id,
      email: user.email,
      role: decodedToken.role,
      name: user.username || user.name, 
      ip
    };

    next();
  } catch (error) {
    return next(new ApiError('An unexpected error occurred during token verification: ' + error.message, 500));
  }
};

type UserRole = 'SERVICE_PROVIDER' | 'AGENT' | 'CLIENT';

export const isAuthorized = (allowedRoles: UserRole[]) => {

  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    console.log('isAuthorized middleware');
    console.log('req.user:', req.user); 
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ApiError('You do not have permission to access this resource', 403));
    }
    next();
  };
};

// Multer configuration for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5, // Limit to 5MB
  },
});

export {
  upload
};
