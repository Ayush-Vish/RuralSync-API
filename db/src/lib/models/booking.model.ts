import mongoose from 'mongoose'

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
        required: true,
    },
    service: {
        type: String,
        required: true,
        enum: ['Cleaning', 'Plumbing', 'Electrical', 'Appliance Repair', 'Painting'],
    },
    bookingDate: {
        type: Date,
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
}, { timestamps: true }); // This automatically adds 'createdAt' and 'updatedAt' fields

// Export the Booking model
export const Booking = mongoose.model('Booking', bookingSchema);
