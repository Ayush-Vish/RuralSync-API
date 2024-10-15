import { Agent, Org, RequestWithUser, Service, ServiceProvider } from '@org/db';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@org/utils';

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
    const { orgName, address, phone } = req.body;

    if (!orgName || !address || !phone) {
      return next(new ApiError('All fields are required', 400));
    }

    console.log(req.user.id);

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

    const newOrg = await Org.create({
      name: orgName,
      address,
      phone,
      ownerId: req.user.id,
    });

    return res
      .status(201)
      .json({ message: 'Organization created successfully', data: newOrg });
  } catch (error) {
    return next(new ApiError('An error occurred: ' + error.message, 500));
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

    if (!name || !description || !basePrice || !category || !availability || !location || !address) {
      return next(new ApiError('All required fields must be provided', 400));
    }

    if (!ownerId) {
      return next(new ApiError('Owner Id not found', 400));
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
        coordinates: [location.longitude, location.latitude]
      },
      address,
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

const assignAgent = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { agentId, serviceId } = req.body;
    if (!agentId || !serviceId) {
      return next(new ApiError('Agent Id and Service Id are required', 400));
    }
    const service = await Service.findById(serviceId);
    if (!service) {
      return next(new ApiError('Service not found', 404));
    }
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return next(new ApiError('Agent not found', 404));
    }
    await service.assignedAgents.push(agentId);
    await service.save();
    return res.status(200).json({ message: 'Agent assigned successfully' });
  } catch (error) {
    return next(new ApiError('An error occurred: ' + error.message, 500));
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


const searchServices = async (req :Request, res: Response, next: NextFunction) =>  {
  try {
    console.log('Search Services');
    const { searchString, latitude, longitude, page, limit } = req.query as SearchQuery;
    const services = await Service.find() ;

    
  } catch (error) {
    return next(new ApiError('An error occurred: ' + error.message, 500));  
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
  searchServices
};

