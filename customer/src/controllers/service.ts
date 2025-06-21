
import { Request, Response, NextFunction } from 'express';
import { Service, ServiceProvider } from '@org/db';
import { ApiError } from '@org/utils';                            
export const getServiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id)
      .populate('serviceProvider', 'name email')
      .populate('serviceCompany', 'name categories')
      .exec();

    if (!service) {
      return next(new ApiError(`Service with ID ${id} not found`, 404));
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(
      new ApiError(
        `An error occurred while fetching service with ID ${req.params.id}: ${error.message}`,
        500
      )
    );
  }
};





export const getAllServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const services = await Service.find({})
      .populate('serviceProvider', 'name email')
      .populate('serviceCompany','name categories')
      .exec();
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
    const serviceProviders = await ServiceProvider.find({})
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






