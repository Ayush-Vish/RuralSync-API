import { Agent, Client, Role, ServiceProvider } from '@org/db';
import { sign, verify } from 'jsonwebtoken';
import { Response } from 'express';
import { Mongoose, ObjectId, Schema } from 'mongoose';


export function utils(): string {
  return 'utils';
}


export const errorMiddleware = (err,req,res,next) =>{
  err.status = err.status || 500
  console.log(err.message)
  err.message  = err.message || "Something went Wrong"
  res.status(err.status).json({
      success:false,
      message:err.message,
      stack:err.stack
      
  })
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
  secure: true,
  sameSite: "none",
};


export const generateAccessAndRefreshToken = async (role : Role , id :any)  => {
  try {
    let user = null;
    switch (role ) {
      case "CLIENT" :
         user =await Client.findById(id);
        break;
      case "AGENT" :
        user = await Agent.findById(id);
        break;
      case "SERVICE_PROVIDER" :
        user =await ServiceProvider.findById(id);
        break;

    }
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    const accessToken =  sign(
      {
        id: await user._id,
        email: await user.email,
        name: await  user.name,
        role,
      },
      "SOME_SECRET",
      {
        expiresIn: "7d",
      }
    );
    console.log(verify(accessToken  , "SOME_SECRET"));
    const refreshToken = sign(
      {
        id:await  user._id,
        email:await user.email,
        name: await user.name,
        role,
      },
      "SOME_SECRET",

      {
        expiresIn: "7d",
      }
    );
    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError("Error generating token" + error.message, 500);
  }
} 