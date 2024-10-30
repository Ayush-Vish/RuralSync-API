import {
  Agent,
  Booking,
  Org,
  RequestWithUser,
  Service,
  ServiceProvider,
} from '@org/db';
import { json, NextFunction, Request, Response } from 'express';
import {
  addEmailJob,
  ApiError,
  ApiResponse,
  emailQueue,
  uploadFileToS3,
} from '@org/utils';

const getServiceProviderById = async (req: Request, res: Response) => {
  try {
    const serviceProvider = await ServiceProvider.findById(req.params.id);
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }
    return res.status(200).json(serviceProvider);
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred' });
  }
};

const updateServiceProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone, address, services } = req.body;
    const updatedServiceProvider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      { phone, address, services },
      { new: true, runValidators: true }
    );
    if (!updatedServiceProvider) {
      return next(new ApiError('Service Provider not found', 404));
    }
    return res.status(200).json({ data: updatedServiceProvider });
  } catch (error) {
    return next(new ApiError('An error occurred', 500));
  }
};

const registerOrg = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      address,
      phone,
      description,
      website,
      location,
      socialMedia,
      businessHours,
      isVerified = true,
    } = req.body;
    console.log('req.body', req.body);
    if (!name || !address || !phone) {
      return next(
        new ApiError('Organization name, address, and phone are required', 400)
      );
    }

    const serviceProvider = await ServiceProvider.findById(req.user.id);
    if (!serviceProvider) {
      return next(new ApiError('Service Provider not found', 404));
    }

    const existingOrg = await Org.findOne({ ownerId: req.user.id });
    if (existingOrg) {
      return next(
        new ApiError('Owner can only register one organization', 400)
      );
    }
    console.log('1');
    // Handle logo upload
    let logoUrl = '';
    if (req.files && req.files.logo && req.files.logo[0]) {
      const logoUpload = await uploadFileToS3(req.files.logo[0]);
      logoUrl = logoUpload.url;
    }
    console.log('2');

    // Handle multiple images upload
    let imageUrls: string[] = [];
    if (req.files && req.files.images) {
      const uploadPromises = req.files.images.map((file) =>
        uploadFileToS3(file)
      );
      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = uploadResults.map((result) => result.url);
    }
    console.log('3');
    const newOrg = new Org({
      name,
      address,
      phone,
      description,
      website,
      logo: logoUrl,
      images: imageUrls,
      location: JSON.parse(location),
      socialMedia: JSON.parse(socialMedia),
      businessHours: JSON.parse(businessHours),
      isVerified,
      ownerId: req.user.id,
    });
    console.log('4');

    await newOrg.save();

    return res.status(201).json({
      message: 'Organization created successfully',
      data: newOrg,
    });
  } catch (error) {
    return next(new ApiError(`An error occurred: ${error.message}`, 500));
  }
};

const getOrgDetails = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('sdfjbsdjkfsdjfnsdk');
    console.log(req.user.id);
    const org = await Org.findOne({ ownerId: req.user.id });
    if (!org) {
      return next(new ApiError('Organization not found', 404));
    }
    console.log(org);
    return res.status(200).json(org);
  } catch (error) {
    return next(new ApiError('An error occurred: ' + error.message, 500));
  }
};

const addNewService = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Add new service');

    const {
      name,
      description,
      basePrice,
      category,
      availability,
      estimatedDuration,
      location,
      address,
      tags,
    } = req.body;

    console.log(req.body);

    const ownerId = req.user?.id;
    if (!ownerId) {
      return next(new ApiError('Owner Id not found', 400));
    }

    // Validate required fields
    if (
      !name ||
      !description ||
      !basePrice ||
      !category ||
      !availability ||
      !location
    ) {
      return next(new ApiError('All required fields must be provided', 400));
    }

    const owner = await ServiceProvider.findById(ownerId);
    if (!owner) {
      return next(new ApiError('Owner not found', 404));
    }

    const org = await Org.findOne({ ownerId });
    if (!org) {
      return next(new ApiError('Organization not found', 404));
    }

    // Handle Image Upload
    console.time('Upload Images');
    let imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files.images)) {
      const uploadPromises = req.files.images.map((file) =>
        uploadFileToS3(file)
      );
      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = uploadResults.map((result) => result.url);
    }
    console.timeEnd('Upload Images');

    // Ensure availability and location are properly parsed
    const parsedAvailability = Array.isArray(availability)
      ? availability.map((item) => ({
          day: item.day,
          startTime: item.startTime,
          endTime: item.endTime,
        }))
      : [];

    const parsedLocation = JSON.parse(location);

    const newService = new Service({
      name,
      description,
      basePrice,
      category,
      availability: parsedAvailability,
      estimatedDuration,
      location: {
        type: 'Point',
        coordinates: parsedLocation.coordinates,
      },
      images: imageUrls,
      address: address || owner.address, // Use owner address as fallback
      tags: tags || [],
      ownerId,
      serviceCompany: org._id,
      serviceProvider: org.ownerId,
    });

    await newService.save();

    // Update Organization with new service
    await Org.findByIdAndUpdate(org._id, {
      $push: { services: newService._id },
    });

    return res
      .status(201)
      .json({ message: 'Service added successfully', data: newService });
  } catch (error) {
    console.error('Error adding service:', error);
    return next(new ApiError('An error occurred: ' + error.message, 500));
  }
};

const assignAgent = async (req, res, next) => {
  try {
    const { agentId, serviceId } = req.body;
    if (!agentId || !serviceId) {
      return next(new ApiError('Agent Id and Service Id are required', 400));
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return next(new ApiError('Service not found', 404));
    }

    // Check if the agent exists
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return next(new ApiError('Agent not found', 404));
    }

    // Add agent to assignedAgents if not already present
    if (!service.assignedAgents.includes(agentId)) {
      service.assignedAgents.push(agentId);
      await service.save();
    }

    return res.status(200).json({ message: 'Agent assigned successfully' });
  } catch (error) {
    return next(new ApiError('An error occurred: ' + error.message, 500));
  }
};

export const assignAgentForaBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { agentId, bookingId } = req.body;
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return next(new ApiError('Agent not Found ', 400));
    }
    const booking = await Booking.findById(bookingId)
      .populate('client', 'name email') // Populate customer details (optional)
      .populate('service', 'name description');

    if (!booking) {
      return next(new ApiError('Booking not Found ', 400));
    }
    console.log(booking);

    await addEmailJob({
      email: agent.email,
      subject: 'New Booking Assigned',
      content: `
        <p>Dear ${agent.name},</p>
        <p>You have been assigned a new booking. Please find the details below:</p>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Service:</strong> ${(booking.service as any).name}</p>
        <p><strong>Client:</strong> ${(booking.client as any).name}</p>
        <p><strong>Booking Date:</strong> ${booking.bookingDate.toDateString()}</p>
        <p><strong>Booking Time:</strong> ${booking.bookingTime}</p>
        <p><strong>Location:</strong> ${booking.location.coordinates.join(
          ', '
        )}</p>
        <p><strong>Extra Tasks:</strong></p>
        <ul>
          ${booking.extraTasks
            .map((task) => `<li>${task.description} - ${task.extraPrice}</li>`)
            .join('')}
        </ul>
        <p>Please make sure to be available at the specified time and location.</p>
        <p>Best regards,<br/>Service Provider</p>
      `,
    });

    booking.agent = agentId;
    booking.status = 'Pending';
    agent.status = 'BUSY';
    await agent.save();
    await booking.save();

    await addEmailJob({
      email: (booking.client as any).email,
      subject: 'Booking Confirmation',
      content: `
        <p>Dear ${(booking.client as any).name},</p>
        <p>Your booking has been confirmed. Please find the details below:</p>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Service:</strong> ${(booking.service as any).name}</p>
        <p><strong>Agent:</strong> ${agent.name}</p>
        <p><strong>Booking Date:</strong> ${booking.bookingDate.toDateString()}</p>
        <p><strong>Booking Time:</strong> ${booking.bookingTime}</p>
        <p><strong>Location:</strong> ${booking.location.coordinates.join(
          ', '
        )}</p>
        <p><strong>Extra Tasks:</strong></p>
        <ul>
          ${booking.extraTasks
            .map((task) => `<li>${task.description} - ${task.extraPrice}</li>`)
            .join('')}
        </ul>
        <p>Thank you for choosing our service. We look forward to serving you.</p>
        <p>Best regards,<br/>Service Provider</p>
      `,
    });
    return new ApiResponse(res, 201, 'Booking Created', {
      agentName: agent.name,
      agentPhone: agent.phoneNumber,
      bookingId,
      agentId,
    });
  } catch (error) {
    return next(new ApiError(error.message, 400));
  }
};

const availableAgents = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Check Availability');
    const ownerId = req.user.id;
    const org = await Org.findOne({
      ownerId,
    });
    if (!org) {
      return next(new ApiError('Organization not found', 404));
    }
    const availableAgents = await Agent.find({
      availability: true,
      serviceCompany: org._id,
    });
    return res.status(200).json(availableAgents);
  } catch (error) {
    return next(new ApiError('An error occurred: ' + error.message, 500));
  }
};

interface SearchQuery {
  searchString?: string;
  latitude?: string;
  longitude?: string;
  page?: number;
  limit?: number;
}

const searchServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Search Services');
    const {
      searchString,
      latitude,
      longitude,
      page = 1,
      limit = 10,
    } = req.query as unknown as SearchQuery;

    const query: any = {};
    const aggregationPipeline = [];
    if (latitude && longitude) {
      aggregationPipeline.push({
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'distance',
          spherical: true,
          maxDistance: 50000, // 10 km range (adjustable)
        },
      });
    }

    // Text-based search
    if (searchString) {
      query.$text = { $search: searchString };
      aggregationPipeline.push({
        $match: query,
      });
      aggregationPipeline.push({
        $sort: { score: { $meta: 'textScore' } },
      });
    } else {
      aggregationPipeline.push({ $match: query });
    }

    // Pagination
    const skip = (page - 1) * limit;
    aggregationPipeline.push({ $skip: skip }, { $limit: limit });

    // Execute aggregation
    const services = await Service.aggregate(aggregationPipeline);

    return res.status(200).json({
      message: 'Services retrieved successfully',
      data: services,
      page,
      limit,
      total: services.length,
    });
  } catch (error) {
    return next(new ApiError('An error occurred: ' + error.message, 500));
  }
};
const getAllServices = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = req.user.id;
    const services = await Service.find({
      serviceProvider: ownerId,
    });
    return res.status(200).json({
      message: 'Services retrieved successfully',
      data: services,
    });
  } catch (error) {
    return next(new ApiError('An error occurred: ' + error.message, 500));
  }
};

const deleteService = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.params);
    const { serviceId } = req.params;

    const service = await Service.findByIdAndDelete(serviceId);
    if (!service) {
      return next(new ApiError('Service not found', 404));
    }
    return res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    return next(new ApiError('An error occurred: ' + error.message, 500));
  }
};
const getAllAgents = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = req.user.id;
    const agents = await Agent.find({ serviceProviderId: ownerId });
    return res.status(200).json({
      message: 'Agents retrieved successfully',
      data: agents,
    });
  } catch (error) {
    return next(new ApiError('An error occurred: ' + error.message, 500));
  }
};
const deleteAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agentId } = req.params;
    const agent = await Agent.findByIdAndDelete(agentId);
    if (!agent) {
      return next(new ApiError('Agent not found', 404));
    }
    return res.status(200).json({ message: 'Agent deleted successfully' });
  } catch (error) {
    return next(new ApiError('An error occurred: ' + error.message, 500));
  }
};

const getAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agentId } = req.params;
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return next(new ApiError('Agent not found', 404));
    }
    const agentBooking = await Booking.find({ agent: agentId });
    const agentServices = await Service.find({ assignedAgents: agentId });

    return res.status(200).json({
      message: 'Agent retrieved successfully',
      agent,
      agentBooking,
      agentServices,
    });
  } catch (error) {
    return next(new ApiError('An error occurred: ' + error.message, 500));
  }
};

const getBookings = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const serviceProviderId = req.user.id;
    const bookings = await Booking.find({ serviceProvider: serviceProviderId })
      .populate('client', 'name email') // Populate customer details (optional)
      .populate('service', 'name description') // Populate service details (optional)
      .populate('agent', 'name email') // Populate agent details (optional)
      .exec();

    return res.status(200).json({
      message: 'Booking fetched Successfully',
      bookings,
    });
  } catch (error) {
    return next(new ApiError('An error occurred: ' + error.message, 500));
  }
};

const getBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate('client', 'name email') // Populate customer details (optional)
      .populate('service', 'name description') // Populate service details (optional)
      .populate('agent', 'name email') // Populate agent details (optional)
      .exec();
    return res.json({
      message: 'Booking fetched successfully',
      booking,
    });
  } catch (error) {
    return next(new ApiError('An Error occured ' + error.message, 500));
  }
};

export {
  getServiceProviderById,
  registerOrg,
  getOrgDetails,
  addNewService,
  updateServiceProvider,
  assignAgent,
  availableAgents,
  searchServices,
  getAllServices,
  deleteService,
  getAllAgents,
  deleteAgent,
  getAgent,
  getBookings,
  getBooking,
};
