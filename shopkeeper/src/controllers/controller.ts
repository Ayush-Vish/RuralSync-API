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



// const searchServices = async (req: Request & {
//   query: SearchQuery
// }, res: Response) => {
//   const { searchString } = req.query;

//   if (!searchString) {
//     return res.status(400).json({ message: 'Search string is required' });
//   }

//   const lowercaseSearch = searchString.toLowerCase();

//   // Build the search query
//   const query = {
//     $or: [
//       { name: new RegExp(lowercaseSearch, 'i') },
//       { description: new RegExp(lowercaseSearch, 'i') },
//       { tags: new RegExp(lowercaseSearch, 'i') }
//     ]
//   };

//   try {
//     const services = await Service.find(query);
//     return res.json(services);
//   } catch (error) {
//     return res.status(500).json({ message: 'Error searching services', error: error.message });
//   }
// };
const searchServices = async (req: RequestWithUser & { query: SearchQuery }, res: Response, next: NextFunction) => {
  try {
    const { searchString, latitude, longitude, page = 1, limit = 20 } = req.query;

    // Check if search string is provided
    if (!searchString) {
      return res.status(400).json({ message: 'Search string is required' });
    }

    const lowercaseSearch = searchString.toLowerCase();

    // Define keywords for different search aspects
    const categoryKeywords = ['category', 'type', 'kind'];
    const priceKeywords = ['under', 'below', 'cheap', 'affordable', 'cost', 'price'];
    const ratingKeywords = ['rating', 'rated', 'stars'];
    const locationKeywords = ['near', 'nearby', 'close to', 'in'];
    const bestKeywords = ['best', 'top', 'highest rated'];

    // Extract search parameters
    const categories = extractCategories(lowercaseSearch);
    const maxPrice = extractMaxPrice(lowercaseSearch);
    const minRating = extractMinRating(lowercaseSearch);
    const location = extractLocation(lowercaseSearch);
    const isBestSearch = bestKeywords.some(keyword => lowercaseSearch.includes(keyword));

    // Log extracted values for debugging
    console.log('Categories:', categories, 'Max Price:', maxPrice, 'Min Rating:', minRating, 'Location:', location, 'Best Search:', isBestSearch);

    // Build the query
    const query: {
      category?: any;
      $or?: any;
      'ratings.average'?: any;
      tags?: any;
      $text?: any;
      'address.city'?: any;
    } = {};

    if (categories.length > 0) {
      query.category = { $in: categories.map(cat => new RegExp(cat, 'i')) };
    }

    if (maxPrice !== null) {
      query.$or = [
        { basePrice: { $lte: maxPrice } },
        { finalPrice: { $lte: maxPrice } }
      ];
    }

    if (minRating !== null) {
      query['ratings.average'] = { $gte: minRating };
    }

    if (isBestSearch) {
      query.tags = 'best-rated';
    }

    // Prepare geospatial query
    let geoNear;
    if (latitude && longitude) {
      geoNear = {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          distanceField: 'distance',
          spherical: true,
          query, // Combine with other query filters
          limit // Limit the number of results after sorting
        }
      };
    } else if (location) {
      query['address.city'] = new RegExp(location, 'i');
    }

    // Prepare text search for remaining terms
    const searchTerms = lowercaseSearch
      .split(' ')
      .filter(term => 
        !categoryKeywords.includes(term) && 
        !priceKeywords.includes(term) && 
        !ratingKeywords.includes(term) && 
        !locationKeywords.includes(term) &&
        !bestKeywords.includes(term)
      )
      .join(' ');

    if (searchTerms) {
      query.$text = { $search: searchTerms, $caseSensitive: false }; // Case insensitive text search
    }

    // Build the aggregation pipeline
    const pipeline: any[] = [];
    if (geoNear) {
      pipeline.push(geoNear);
    }
    
    // Match based on constructed query
    pipeline.push({ $match: query });

    // Sorting
    if (isBestSearch) {
      pipeline.push({ $sort: { 'ratings.average': -1 } });
    } else if (searchTerms) {
      pipeline.push({ $sort: { score: { $meta: 'textScore' } } });
    }

    // Pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip }, { $limit: limit });
    console.log('Pipeline:', pipeline);
    // Execute the query
    const services: ServiceDocument[] = await Service.aggregate(pipeline)
      .lookup({ from: 'serviceproviders', localField: 'serviceProvider', foreignField: '_id', as: 'serviceProvider' })
      .lookup({ from: 'orgs', localField: 'serviceCompany', foreignField: '_id', as: 'serviceCompany' })
      .unwind('serviceProvider')
      .unwind('serviceCompany');

    return res.json(services);
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({ message: 'Error searching services', error: error.message });
  }
};

// Enhanced category extraction with synonyms
function extractCategories(searchString: string): string[] {
  const commonCategories = [
    'home', 
    'electrical', 
    'plumbing', 
    'cleaning', 
    'repair', 
    'gardening', 
    'painting'
  ];
  const synonyms = {
    electrical: ['electrical', 'electric', 'wiring'],
    plumbing: ['plumbing', 'pipes', 'leaks'],
    cleaning: ['cleaning', 'tidy', 'neat'],
    repair: ['repair', 'fix', 'service'],
    gardening: ['gardening', 'landscaping', 'outdoor'],
    painting: ['painting', 'decorating', 'coloring'],
  };

  // Flatten synonyms into a single array
  const synonymCategories = Object.values(synonyms).flat();

  return commonCategories.filter(category =>
    searchString.toLowerCase().includes(category) ||
    synonymCategories.some(synonym => searchString.toLowerCase().includes(synonym))
  );
}




function extractMaxPrice(searchString: string): number | null {
  const priceMatch = searchString.match(/under (\d+)/i) || searchString.match(/below (\d+)/i);
  return priceMatch ? parseFloat(priceMatch[1]) : null;
}

function extractMinRating(searchString: string): number | null {
  const ratingMatch = searchString.match(/(\d+(?:\.\d+)?)[\s+]?stars?/i) || 
                      searchString.match(/rated (\d+(?:\.\d+)?)/i);
  return ratingMatch ? parseFloat(ratingMatch[1]) : null;
}

function extractLocation(searchString: string): string | null {
  // Capture phrases like "in Gwalior", "near Gwalior", "close to Gwalior"
  const locationMatch = searchString.match(/(?:in|near|close to|at) ([^,]+)/i);
  return locationMatch ? locationMatch[1].trim() : null;
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
};

