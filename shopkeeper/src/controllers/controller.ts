import { Agent, Booking, Org, RequestWithUser, Service, ServiceProvider } from '@org/db';
import { NextFunction, Request, Response } from 'express';
import { ApiError, ApiResponse } from '@org/utils';

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
      orgName,
      address,
      phone,
      description,
      website,
      logo,
      location,
      socialMedia,
      businessHours,
      isVerified = true,
    } = req.body;

    if (!orgName || !address || !phone) {
      return next(new ApiError('Organization name, address, and phone are required', 400));
    }

    const serviceProvider = await ServiceProvider.findById(req.user.id);
    if (!serviceProvider) {
      return next(new ApiError('Service Provider not found', 404));
    }

    const existingOrg = await Org.findOne({ ownerId: req.user.id });
    if (existingOrg) {
      return next(new ApiError('Owner can only register one organization', 400));
    }

    const newOrg = new Org({
      name: orgName,
      address,
      phone,
      description,
      website,
      logo,
      location, 
      socialMedia,
      businessHours,
      isVerified,
      ownerId: req.user.id,
    });

    await newOrg.save();

    return res.status(201).json({ message: 'Organization created successfully', data: newOrg });
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
      tags
    } = req.body;

    const ownerId = req.user.id;
    console.log(req.body)
    if (!name || !description || !basePrice || !category || !availability || !location  ) {
      return next(new ApiError('All required fields must be provided', 400));
    }
    
    console.log(location.coordinates[0]);
 
    if (!ownerId) {
      return next(new ApiError('Owner Id not found', 400));
    }
    const owner = await ServiceProvider.findById(ownerId);
    if (!owner) {
      return next(new ApiError('Owner not found', 404));
    }

    const org = await Org.findOne({ ownerId: req.user.id });
    if (!org) {
      return next(new ApiError('Organization not found', 404));
    }

    const newService = new Service({
      name,
      description,
      basePrice,
      category,
      availability,
      estimatedDuration,
      location: {
        type: 'Point',
        coordinates: [location.coordinates[0], location.coordinates[1]]
      },
      address:owner.address,
      tags: tags || [],
      ownerId,
      serviceCompany: org._id,
      serviceProvider: org.ownerId,
    });

    await newService.save();
    await Org.findByIdAndUpdate(org._id, { $push: { services: newService._id } });

    return res
      .status(201)
      .json({ message: 'Service added successfully', data: newService });
  } catch (error) {
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


export const assignAgentForaBooking =async  (req :Request , res : Response,  next : NextFunction ) => {
  try {
    const {
      agentId , bookingId 
    } = req.body ;
    const agent = await Agent.findById(agentId);
    if(!agent) {
      return next(new ApiError("Agent not Found ", 400 ) ) ;
    }
    const booking = await Booking.findById(bookingId);
    if(!booking) {
      return next(new ApiError("Booking not Found " , 400 )) ;
    }
    booking.agent = agentId;
    return new ApiResponse(res , 201 , "Booking Created" , {
      agentName : agent.name ,
      agentPhone : agent.phoneNumber,
      bookingId , 
      agentId
    })


  } catch (error) {
    return next(new ApiError(error.message  , 400))
  }
}

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

interface SearchQuery{
  searchString?: string;
  latitude?: string;
  longitude?: string;
  page?: number;
  limit?: number;
}

interface ServiceDocument {
  category: string[];
  basePrice: number;
  finalPrice: number;
  ratings: {
    average: number;
  };
  serviceProvider: any;
  serviceCompany: any; 
}


const searchServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Search Services");
    const { searchString, latitude, longitude, page = 1, limit = 10 } = req.query as unknown as SearchQuery;

    const query: any = {};
    const aggregationPipeline = [];
    if (latitude && longitude) {
      aggregationPipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distance",
          spherical: true,
          maxDistance: 50000, // 10 km range (adjustable)
        }
      });
    }

    // Text-based search
    if (searchString) {
      query.$text = { $search: searchString };
      aggregationPipeline.push({
        $match: query
      });
      aggregationPipeline.push({
        $sort: { score: { $meta: "textScore" } }
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
      message: "Services retrieved successfully",
      data: services,
      page,
      limit,
      total: services.length,
    });
  } catch (error) {
    return next(new ApiError("An error occurred: " + error.message, 500));
  }
};
const getAllServices = async (req: Request, res: Response, next: NextFunction) =>  {
  try {
    const services = await Service.find();
    return res.status(200).json({
      message: "Services retrieved successfully",
      data: services,
    });
  } catch (error) {
    return next(new ApiError("An error occurred: " + error.message, 500));
  }
}

const deleteService = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    console.log(req.params)
    const {serviceId} = req.params;
  
    const service = await Service.findByIdAndDelete(serviceId);
    if (!service) {
      return next(new ApiError("Service not found", 404));
    }
    return res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    return next(new ApiError("An error occurred: " + error.message, 500));
  }
}
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
  deleteService
};

