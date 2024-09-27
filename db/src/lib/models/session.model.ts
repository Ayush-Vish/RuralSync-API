import { Request } from 'express';
import mongoose from 'mongoose';
import { Schema } from 'mongoose';
const sessionSchema = new Schema({
      clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
      ipAddress: { type: String },
      device: { type: String },
      browser: { type: String },
      loginTime: { type: Date, default: Date.now },
      logoutTime: { type: Date },
      active: { type: Boolean, default: true },
    });
    
export const Session = mongoose.model('Session', sessionSchema);
export type Role = 'CLIENT' | 'AGENT' | 'SERVICE_PROVIDER';
export type User = {
  id: string;
  role: Role;
  email: string;
  name: string;
  
};
export interface RequestWithUser extends Request  {
  user: User;
}