import mongoose from 'mongoose';

// Define the schema for an extra task

// Define a point schema for location data
export const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

// Define the schema for a booking
const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  bookingTime: { // New field for time (e.g., 10:30 AM)
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  totalPrice: {
    type: Number,
    // required: true,
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid',
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: false,
  },
  extraTasks: [{
    description:{
      type:String
    }, 
    extraPrice:{
      type:String
    } 
  }], // Include extra tasks in the booking
  location: { // Include location of the service (if applicable)
    type: pointSchema,
    index: '2dsphere',
  },
}, { timestamps: true });

// Export the Booking model
export const Booking = mongoose.model('Booking', bookingSchema);
