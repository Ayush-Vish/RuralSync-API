import mongoose, { Schema } from 'mongoose';

const bookingSchema = new Schema({
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  serviceProvider: { type: Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
  service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  date: { type: Date, required: true }, // Booking date and time
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'CANCELLED'], default: 'PENDING' },
  additionalServices: [{ type: String }], // Array of additional services requested
  totalPrice: { type: Number, required: true }, // Total price including any extra services
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

bookingSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export { Booking };
