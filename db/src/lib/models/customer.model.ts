import { hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import mongoose from "mongoose";

const { Schema } = mongoose;

const clientSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  password: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  profile: {
    bio: { type: String },
    profilePicture: { type: String }
  },
  bookings: {  type: mongoose.Schema.Types.ObjectId,  ref: 'Booking' },

  ip: { type: String },
  refreshToken: { type: String }, // For token refresh
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


clientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await hash(this.password, 10);
  return next();
});

// Method to sign JWT token
clientSchema.method('signToken', function () {
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

export const Client = mongoose.model('Client', clientSchema);
