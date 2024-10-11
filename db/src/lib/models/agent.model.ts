import { hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import mongoose from "mongoose";

const { Schema } = mongoose;

const agentSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    clients: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
    serviceProvider: { type: Schema.Types.ObjectId, ref: 'ServiceProvider' },
    ip: { type: String },
    refreshToken: { type: String }, 
    createdAt: { type: Date, default: Date.now }
});

agentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      return next();
    }
    this.password = await hash(this.password, 10);
    return next();
  });
  
  // Method to sign JWT token
  agentSchema.method('signToken', function () {
    return sign(
      {
        id: this._id,
        email: this.email,
        name: this.name,
        role: 'SERVICE_PROVIDER',
      },
      'SOME_SECRET'
    );
  });

export const Agent = mongoose.model('Agent', agentSchema);


