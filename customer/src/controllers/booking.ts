import { Booking, RequestWithUser, Service } from '@org/db';
import { ApiError } from '@org/utils';
import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import mongoose, { Mongoose } from 'mongoose';

// Utility function for date validation
const isValidDate = (date) => {
  return !isNaN(Date.parse(date));
};
type ExtraTask = {
  description: string;
  extraPrice: number;
  // timeAdded?: string;
};

type Location = {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
};

type NewBookingData = {
  customer: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  // serviceProvider: mongoose.Types.ObjectId;
  bookingDate: Date;
  bookingTime: string; 
  // totalPrice: number;
  serviceItems?: ExtraTask[];
  location?: Location;
};

export const createBooking = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const customerId = req.user.id   // Assuming customer ID is extracted from the authenticated user
    const {
      serviceId,
      bookingDate,
      bookingTime,
      extraTasks,
      location,
      // totalPrice,
      // serviceProviderId,
    }: {
      serviceId: string;
      bookingDate: string;
      bookingTime: string;
      extraTasks?: ExtraTask[];
      location?: Location;
      // totalPrice: number;
      // serviceProviderId: string;
    } = req.body;

    // Validate required fields
    if (!serviceId || !bookingDate || !bookingTime  ) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Validate total price
    

    // Validate booking time (e.g., "10:00 AM", "2:30 PM")
    const timeRegex = /^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i;
    if (!timeRegex.test(bookingTime)) {
      res.status(400).json({ message: 'Invalid booking time format. Use format like "10:00 AM"' });
      return;
    }

    // Validate location if provided
    if (location) {
      if (
        !location.type ||
        location.type !== 'Point' ||
        !Array.isArray(location.coordinates) ||
        location.coordinates.length !== 2
      ) {
        res.status(400).json({
          message: 'Invalid location format. Location must be a geoJSON Point with [longitude, latitude]',
        });
        return;
      }
    }

    // Check if the service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    // Combine date and time using moment.js
    // const fullBookingDate = moment(`${bookingDate} ${bookingTime}`, 'YYYY-MM-DD hh:mm A');
    // if (!fullBookingDate.isValid()) {
    //   res.status(400).json({ message: 'Invalid booking date or time format' });
    //   return;
    // }


        // Validate and format the date using moment.js
        const formattedBookingDate = moment(bookingDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
        if (!moment(formattedBookingDate, 'YYYY-MM-DD', true).isValid()) {
          res.status(400).json({ message: 'Invalid booking date format. Use "YYYY-MM-DD"' });
          return;
        }

    // Build the booking object
    const newBookingData: NewBookingData = {
      customer: customerId as any,
      service: serviceId as any ,
      // serviceProvider: new mongoose.Types.ObjectId(serviceProviderId),
      bookingDate: new Date(`${formattedBookingDate}T00:00:00Z`), // Only save the date part
      bookingTime: bookingTime, // Save time as string
      // totalPrice,
    };

    // If extra tasks are provided, add them to the booking
    if (extraTasks && extraTasks.length > 0) {
      newBookingData.serviceItems = extraTasks.map((task) => ({
        description: task.description,
        extraPrice: task.extraPrice,
        // timeAdded: task.timeAdded || null,
      }));
    }

    // If location is provided, add it to the booking
    if (location) {
      newBookingData.location = location;
    }
    console.log(newBookingData)
    // Create the new booking
    const newBooking = await Booking.create(newBookingData);

    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get Customer Bookings
export const getBookings = async (req, res) => {
  try {
    const customerId = req.user.id; // Extract from the auth token

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
    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      // Check if bookingId is a valid ObjectId format
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking || booking.customer.toString() !== customerId) {
      return res
        .status(404)
        .json({ message: 'Booking not found or not authorized' });
    }

    await Booking.findByIdAndDelete(bookingId);
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Get Services');
    const { orgId } = req.params;
    const services = await Service.find({ orgId });
    if (!services) {
      return next(new ApiError('No services found', 404));
    }
    return res.status(200).json(services);
  } catch (error) {
    return next(new ApiError('An error occurred: ' + error.message, 500));
  }
};
