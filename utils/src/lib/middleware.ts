import { Agent, Client, RequestWithUser, ServiceProvider } from '@org/db';
import { ApiError } from './utils';
import { verify } from 'jsonwebtoken';
import { NextFunction, Response } from 'express';

export const verifyJWT = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("req.cookies" , req.cookies);
    // Get token from either cookies or Authorization header
    // console.log("addddiiiil",req.cookies.accessToken)
    const {token} = req.cookies
      // req.cookies?.accessToken ||
      // req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next(new ApiError('Access Token is required', 401));
    }

    // console.log("toooooken",token)
    // Verify token
    const decodedToken: any = verify(token, 'SOME_SECRET');
    // console.log("decodedToken" , decodedToken);
    // console.log("decodedToken" , decodedToken);
    if (!decodedToken || !decodedToken.role) {
      return next(new ApiError('Invalid Access Token', 401));
    }

    // Retrieve role from decoded token
    const { role } = decodedToken;

    // Fetch user based on role and decoded token ID
    console.log(decodedToken.id)
    let user = null;
    switch (role) {
      case 'CLIENT':
        user = await Client.findById(decodedToken.id).select(
          '-password -refreshToken'
        );
        break;
      case 'AGENT':
        user = await Agent.findById(decodedToken.id).select(
          '-password -refreshToken'
        );
        break;
      case 'SERVICE_PROVIDER':
        user = await ServiceProvider.findById(decodedToken.id).select(
          '-password -refreshToken'
        );
        break;
      default:
        return next(new ApiError('Invalid role', 401));
    }

    if (!user) {
      return next(new ApiError('Invalid Access Token', 401));
    }
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress ;
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
    return next(new ApiError('An error occurred: ' + error.message, 500));
  }
};

type UserRole = 'SERVICE_PROVIDER' | 'AGENT' | 'CLIENT';

export const isAuthorized = (allowedRoles: UserRole[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ApiError('Unauthorized', 403));
    }
    next();
  };
};
