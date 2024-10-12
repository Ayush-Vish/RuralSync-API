import { hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import mongoose from "mongoose";

<<<<<<< HEAD
// Define the schema for the Agent
const agentSchema = new mongoose.Schema({
  agentId: {
    type: String,
    // required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: { type: String, required: true },
  phoneNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  services: {
    type: [String], // Array of services like coolerRepair, washingMachineRepair
    required: true
  },
  serviceArea: {
    type: String,
    required: true
  },
  availability: {
    type: String,
    required: true
  },
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  customerId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  rating: {
    type: Number,
    default: 0
  },
  feedback: [{
    type: String
  }],
  currentBookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  completedBookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a pre-save middleware to update the updatedAt field
agentSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
  });
  

// Create the Agent model using the schema
 export const Agent = mongoose.model('Agent', agentSchema);
=======
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
        role: 'AGENT',
      },
      'SOME_SECRET'
    );
  });

export const Agent = mongoose.model('Agent', agentSchema);
>>>>>>> 3845ca4fad34cbe79340011b3c8726bbbaf5a078


