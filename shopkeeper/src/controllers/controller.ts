import { Org, RequestWithUser, Service, ServiceProvider } from '@org/db';
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
const getOrgDetails = async (req: RequestWithUser, res: Response, next : NextFunction) =>  {
  try {
    console.log("sdfjbsdjkfsdjfnsdk")
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
}
const addNewService = async(  req: RequestWithUser, res: Response, next: NextFunction) =>  {
  try {
      console.log("Add new service");
      const {
        name,
        description,
        basePrice,
        category,
        availability,
      } = req.body;
      const ownerId = req.user.id;
      if (!name || !description || !basePrice || !category || !availability) {
        return next(new ApiError('All fields are required', 400));
      }
      if(!ownerId) {
        return next(new ApiError('Owner Id not found', 400));
      }
      const org = await Org.findOne({ ownerId: req.user.id });
      if (!org) {
        return next(new ApiError('Organization not found', 404));
      }
      const newService = await new Service({
        name,
        description,
        basePrice,
        category,
        availability,
        ownerId,
      }).save();
      org.services.push(newService._id);
      

  } catch (error) {
    return next(new ApiError('An error occurred: ' + error.message, 500));
  }
}

export { getServiceProviderById, registerOrg, getOrgDetails , addNewService , updateServiceProvider };
