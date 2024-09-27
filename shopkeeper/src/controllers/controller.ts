import { Org, RequestWithUser, ServiceProvider} from "@org/db"
import { NextFunction, Request, Response } from "express";

import { ApiError } from "@org/utils";

const getServiceProviderById = async (req: Request, res: Response ) =>  {
      try {
            
      const serviceProvider = await ServiceProvider.findById(req.params.id);
      if (!serviceProvider) {
            return res.status(404).json({ message: 'Service Provider not found' });
      }
      return res.status(200).json(serviceProvider);
      } catch (error) {
      return res.status(500).json({ message: 'An error occurred' });
      }
}
const updateServiceProvider = async (req: Request, res: Response, next: NextFunction) => {
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
    



const registerOrg = async (req: RequestWithUser, res: Response, next: NextFunction) =>  {
  try {
    const {
      orgName , 
      address ,
      phone,
    } = req.body;
    if(!orgName || !address || !phone) {
      return next(new ApiError('All fields are required', 400));
    }
    console.log(req.user.id);
    const serviceProvider = await ServiceProvider.findById(req.user.id);
    if(!serviceProvider) {
      return next(new ApiError('Service Provider not found', 404));
    }
    const newOrg = await Org.create({
      name : orgName,
      address,
      phone,
      ownerId: req.user.id,
    });
    return res.status(201).json({ message: 'Organization created successfully', data: newOrg });

  }catch (error) {
    return next(new ApiError('An error occurred', 500));
  }
}





export {
  getServiceProviderById, 
  registerOrg
}