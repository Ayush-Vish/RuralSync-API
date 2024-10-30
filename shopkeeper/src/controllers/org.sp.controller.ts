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





export {
  getServiceProviderById,
  registerOrg,
  getOrgDetails,
  updateServiceProvider,


};
