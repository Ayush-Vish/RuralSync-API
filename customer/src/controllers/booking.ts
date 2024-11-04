import { Booking, RequestWithUser, Service, ServiceProvider } from '@org/db';
import { ApiError, addAuditLogJob, addEmailJob } from '@org/utils';
import { RequestId } from 'aws-sdk/clients/cloudwatchlogs';
import { NextFunction, Request, RequestParamHandler, Response } from 'express';
import moment from 'moment';
import mongoose from 'mongoose';

/// Utility function for date validation
// const isValidDate = (date: string) => {
//   return !isNaN(Date.parse(date));
// };

type ExtraTask = {
  description: string;
  extraPrice: number;
};

type Location = {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
};

type NewBookingData = {
  client: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  bookingDate: Date;
  bookingTime: string;
  extraTasks?: ExtraTask[];
  location?: Location;
};

export const createBooking = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user.id; // Assuming customer ID is extracted from the authenticated user
    const {
      serviceId,
      bookingDate,
      bookingTime,
      extraTasks,
      location,
    }: {
      serviceId: string;
      bookingDate: string;
      bookingTime: string;
      extraTasks?: ExtraTask[];
      location?: Location;
    } = req.body;

    

    // Validate required fields
    if (!serviceId || !bookingDate || !bookingTime) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Validate booking time (e.g., "10:00 AM", "2:30 PM")
    const timeRegex = /^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i;
    if (!timeRegex.test(bookingTime)) {
      res.status(400).json({
        message: 'Invalid booking time format. Use format like "10:00 AM"',
      });
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
          message:
            'Invalid location format. Location must be a geoJSON Point with [longitude, latitude]',
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

    // Validate and format the date using moment.js
    const formattedBookingDate = moment(bookingDate, 'YYYY-MM-DD').format(
      'YYYY-MM-DD'
    );
    if (!moment(formattedBookingDate, 'YYYY-MM-DD', true).isValid()) {
      res
        .status(400)
        .json({ message: 'Invalid booking date format. Use "YYYY-MM-DD"' });
      return;
    }

    // Build the booking object
    const newBookingData: NewBookingData = {
      client: customerId as any,
      service: serviceId as any,
      bookingDate: new Date(`${formattedBookingDate}T00:00:00Z`), // Only save the date part
      bookingTime: bookingTime, // Save time as string,
    };

    // If extra tasks are provided, add them to the booking
    if (extraTasks && extraTasks.length > 0) {
      newBookingData.extraTasks = extraTasks.map((task) => ({
        description: task.description,
        extraPrice: task.extraPrice,
      }));
    }

    // If location is provided, add it to the booking
    if (location) {
      newBookingData.location = location;
    }

    // Create the new booking
    const newBooking = await Booking.create({
      ...newBookingData,
      serviceProvider: service.serviceProvider,
    });
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('service', 'name description')
      .populate('client', 'name email')
      .populate('serviceProvider', 'name email')
      .exec();
    console.log('PopulatedBooking ', populatedBooking);
    await populatedBooking.save();

    // if (populatedBooking) {
    //   // Extract necessary information
    //   const clientEmail = (populatedBooking.client as any).email;
    //   const clientName = (populatedBooking.client as any).name;
    //   const serviceName = (populatedBooking.service as any).name;
    //   const bookingDate = (populatedBooking.bookingDate as any).toDateString();
    //   const bookingTime = populatedBooking.bookingTime as any;
    //   const serviceProviderEmail = (populatedBooking.serviceProvider as any)
    //     .email;
    //   const serviceProviderName = (populatedBooking.serviceProvider as any)
    //     .name;

    //   // Send email to client
    //   console.log("Client ema", clientEmail)
    //   await addEmailJob({
    //     email: clientEmail,
    //     subject: 'Booking Confirmation',
    //     content: `Hello ${clientName},\n\nYour booking for ${serviceName} on ${bookingDate} at ${bookingTime} has been confirmed.\n\nThank you for choosing our service.\n\nBest,\nService Provider`,
    //   });
    //   console.log("Client ema", serviceProviderEmail);
    //   // Send email to service provider
    //   await addEmailJob({
    //     email: serviceProviderEmail,
    //     subject: 'New Booking',
    //     content: `Hello ${serviceProviderName},\n\nYou have a new booking for ${serviceName} on ${bookingDate} at ${bookingTime}.\n\nBest,\nService`,
    //   });
    // } else {
    //   res.status(404).json({ message: 'Failed to Send email' });
    // }
    await addAuditLogJob({
      action: 'CREATE_BOOKING',
      userId: customerId,
      role: 'CLIENT',
      targetId: newBooking._id,
      metadata: {
        service: serviceId,
        bookingDate: formattedBookingDate,
        bookingTime,
        extraTasks,
        location,
      },
      username: req.user.name,
      serviceProviderId: service.serviceProvider,
    })

    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// Get Customer Bookings
export const getCustomerBookings = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user.id; // Assuming customer ID is extracted from authenticated user

    // Validate that the customerId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      res.status(400).json({ message: 'Invalid customer ID' });
      return;
    }

    // Fetch all bookings associated with the customer
    const customerBookings = await Booking.find({ customer: customerId }).sort({
      bookingDate: -1,
    }); // Sort bookings by most recent first

    // Check if bookings are found
    if (customerBookings.length === 0) {
      res.status(404).json({ message: 'No bookings found for this customer' });
      return;
    }
    

    // Return the bookings
    res.status(200).json(customerBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// Delete a Booking
export const deleteBooking = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    // Get the booking ID from the request parameters
    console.log('adihsjdfbhjfbdjhfbg', req.params);
    const { id } = req.params;

    console.log('adillllllll', id);
    // Check if the booking ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid booking ID format' });
      return;
    }

    // Find and delete the booking
    const deletedBooking = (await Booking.findByIdAndDelete(id)).populate('Service');

    // If no booking was found, return a 404 error
    if (!deletedBooking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }


     // Fetch the customer details
     const customer = await req.user;

     // Send email to the customer notifying them of the cancellation
    //  await addEmailJob({
    //    email: customer.email,
    //    subject: 'Booking Cancellation',
    //    content: `
    //      <p>Dear ${customer.name},</p>
    //      <p>Your booking has been successfully canceled. Here are the details:</p>
    //      <p><strong>Booking ID:</strong> ${deletedBooking._id}</p>
    //      <p><strong>Service:</strong> ${deletedBooking.service.name}</p>
    //      <p><strong>Booking Date:</strong> ${moment(deletedBooking.bookingDate).format('YYYY-MM-DD')}</p>
    //      <p><strong>Booking Time:</strong> ${deletedBooking.bookingTime}</p>
    //      <p>We are sorry for any inconvenience this may have caused.</p>
    //      <p>Best regards,<br/>Service Provider</p>
    //    `,
    //  });

    // Return a success message
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const services = await Service.find({})
      // .populate('client', 'name email') // Populate customer details (optional)
      // .populate('ServiceProvider', 'name email') // Populate provider details
      // .populate('Org','name categories')
      // .exec();
    if (!services || services.length === 0) {
      return next(new ApiError('No services found', 404));
    }

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    next(
      new ApiError(
        'An error occurred while fetching services: ' + error.message,
        500
      )
    );
  }
};
export const getAllServiceProviders = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const serviceProviders = await ServiceProvider.find()
  .populate({
    path: 'serviceCompany',
    select: 'name categories description images rating' // Combine all fields into one select
  })
  






    console.log("serviceProviders", serviceProviders);

    if (serviceProviders.length === 0) {
      return res.status(200).json({
        message: 'No service providers found',
        data: [],
      });
    }

    res.status(200).json({
      message: 'Service providers retrieved successfully',
      data: serviceProviders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};







//PUBLIC ROUTES MADE BY  HARSH TO DO BOOKING WITHOUT AUTHENITCAITON AND GET BOOKINGS
export const createBooking2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.body.clientId; // Take customer ID from req.userId or req.body.clientId
    if (!customerId) {
      res.status(400).json({ message: 'Client ID is required' });
      return;
    }

    const {
      serviceId,
      bookingDate,
      bookingTime,
      extraTasks,
      location,
    }: {
      serviceId: string;
      bookingDate: string;
      bookingTime: string;
      extraTasks?: ExtraTask[];
      location?: Location;
    } = req.body;

    // Validate required fields
    if (!serviceId || !bookingDate || !bookingTime) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

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

    // Validate and format the date using moment.js
    const formattedBookingDate = moment(bookingDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
    if (!moment(formattedBookingDate, 'YYYY-MM-DD', true).isValid()) {
      res.status(400).json({ message: 'Invalid booking date format. Use "YYYY-MM-DD"' });
      return;
    }

    // Build the booking object
    const newBookingData: NewBookingData = {
      client: customerId as any,
      service: serviceId as any,
      bookingDate: new Date(`${formattedBookingDate}T00:00:00Z`),
      bookingTime: bookingTime,
    };

    // If extra tasks are provided, add them to the booking
    if (extraTasks && extraTasks.length > 0) {
      newBookingData.extraTasks = extraTasks.map((task) => ({
        description: task.description,
        extraPrice: task.extraPrice,
      }));
    }

    // If location is provided, add it to the booking
    if (location) {
      newBookingData.location = location;
    }

    // Create the new booking
    const newBooking = await Booking.create({ ...newBookingData, serviceProvider: service.serviceProvider });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};



export const getCustomerBookings2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.params.clientId; // Extract customer ID from path parameters

    // Validate that the customerId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      res.status(400).json({ message: 'Invalid customer ID' });
      return;
    }

    // Fetch all bookings associated with the customer
    const customerBookings = await Booking.find({ client: customerId })
      .sort({ bookingDate: -1 }); // Sort bookings by most recent first

    // Check if bookings are found
    if (customerBookings.length === 0) {
      res.status(404).json({ message: 'No bookings found for this customer' });
      return;
    }

    // Return the bookings
    res.status(200).json(customerBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};