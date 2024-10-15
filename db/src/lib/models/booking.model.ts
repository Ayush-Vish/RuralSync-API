import mongoose from 'mongoose';

// Define the schema for an extra task
const extraTaskSchema = new mongoose.Schema({
  description: { type: String, required: true },
  extraPrice: { type: Number, required: true },
  timeAdded: { type: String }, 
});

// Define a point schema for location data
const pointSchema = new mongoose.Schema({
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
    required: true,
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
  extraTasks: [extraTaskSchema], // Include extra tasks in the booking
  location: { // Include location of the service (if applicable)
    type: pointSchema,
    index: '2dsphere',
  },
  serviceItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceItem',
    },
  ],
}, { timestamps: true });

// Export the Booking model
export const Booking = mongoose.model('Booking', bookingSchema);
