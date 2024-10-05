import { Agent, Client, Role, ServiceProvider } from '@org/db';
import { sign } from 'jsonwebtoken';
import { Response } from 'express';
import { Mongoose, ObjectId, Schema } from 'mongoose';
import {verify} from 'jsonwebtoken'


export function utils(): string {
  return 'utils';
}


export class ApiResponse  {
  constructor (res:Response , statusCode : number , message : string , data : unknown ) {
    res.status(statusCode).json({
      message,
      data
    })
  }
}

export class ApiError extends Error {
    status:number;
    constructor(message:string , status:number) {
      super(message);
      this.status = status;
      console.log( "Error Message: =>",  message);
      Error.captureStackTrace(this, this.constructor);


    }
}
type CookieOptions =  {
  maxAge: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "none";

}
export const cookieOptions : CookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 100,
  httpOnly: true,
  secure: false,
  sameSite: "none",
};


export const generateAccessAndRefreshToken = (role : Role , id : ObjectId)  : {
  accessToken: string;
  refreshToken: string;
}=> {
  try {
    let user = null;
    switch (role ) {
      case "CLIENT" :
        user = Client.findById(id);
        break;
      case "AGENT" :
        user = Agent.findById(id);
        break;
      case "SERVICE_PROVIDER" :
        user = ServiceProvider.findById(id);
        break;

    }
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    const accessToken =  sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );
    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError("Error generating token", 500);
  }
} 








