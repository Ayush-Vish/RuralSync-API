import mongoose from 'mongoose';
import { hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';

const { Schema } = mongoose;

const serviceProviderSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  isVerified: {
    type: Boolean,
    default: false,
  },
  clients: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
  agents: [{ type: Schema.Types.ObjectId, ref: 'Agent' }],
  services: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

serviceProviderSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await hash(this.password, 10);
  return next();
});


serviceProviderSchema.method("signToken",function(){
  return sign(
    {
      id: this._id,
      email: this.email,
      name: this.name,
      role: 'SERVICE_PROVIDER',
    },
    'SOME_SECRET'
  );
})

const ServiceProvider = mongoose.model(
  'ServiceProvider',
  serviceProviderSchema
);

export { ServiceProvider };
