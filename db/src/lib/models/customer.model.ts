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




export const Client = mongoose.model('Client', clientSchema);
