
import {Booking} from '@org/db'


// Utility function for date validation
const isValidDate = (date) => {
  return !isNaN(Date.parse(date));
};

// Create a Booking
export const createBooking = async (req, res) => {
  try {
    const customerId = req.user.id; 
    const { service, bookingDate, serviceProvider, totalPrice } = req.body; 

    if (!service || !bookingDate || !serviceProvider || !totalPrice) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (typeof totalPrice !== 'number' || totalPrice <= 0) {
      return res.status(400).json({ message: 'Total price must be a positive number' });
    }

    if (!isValidDate(bookingDate)) {
      return res.status(400).json({ message: 'Invalid booking date format' });
    }

    const newBooking = await Booking.create({
      customer: customerId,
      service,
      bookingDate,
      serviceProvider,
      totalPrice,
    });

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Customer Bookings
export const getBookings = async (req, res) => {
  try {
    const customerId = req.user.id;  // Extract from the auth token

    const bookings = await Booking.find({ customer: customerId });

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found' });
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a Booking
export const deleteBooking = async (req, res) => {
  try {
    const customerId = req.user.id;
    const bookingId = req.params.id;

    // Validation
    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {  // Check if bookingId is a valid ObjectId format
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking || booking.customer.toString() !== customerId) {
      return res.status(404).json({ message: 'Booking not found or not authorized' });
    }

    await Booking.findByIdAndDelete(bookingId);
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
