import express from 'express';
import {

  getOrgDetails,
  registerOrg,
} from '../controllers/org.sp.controller';
import { isAuthorized, upload, verifyJWT } from '@org/utils';
import { assignAgent, assignAgentForaBooking, availableAgents, deleteAgent, getAgent, getAllAgents } from '../controllers/agent.sp.controller';
import { addNewService, deleteService, getAllServices, searchServices } from '../controllers/service.sp.controller';
import { getBooking, getBookings } from '../controllers/booking.sp.controller';

const router = express.Router();

/**
 * @route GET /
 * @description Welcome message
 */
router.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Welcome to Shopkeeper API',
  });
});

/**
 * @route GET /org-detail
 * @description Get organization details for the service provider
 * @access Private
 */
router.get(
  '/org-detail',
  verifyJWT("SERVICE_PROVIDER"),
  isAuthorized(['SERVICE_PROVIDER']),
  getOrgDetails
);

/**
 * @route POST /register-org
 * @description Register a new organization
 * @access Private
 * @payload {
 *  orgName: string,
 *  address: string,
 *  phone: string,
 *  description?: string,
 *  website?: string,
 *  logo?: string,
 *  location: { type: string, coordinates: [number, number] },
 *  socialMedia?: object,
 *  businessHours?: object,
 *  isVerified?: boolean
 * }
 */
router.post(
  '/register-org',
  verifyJWT("SERVICE_PROVIDER"),
  isAuthorized(['SERVICE_PROVIDER']),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'images', maxCount: 5 },
  ]),
  registerOrg
);

/**
 * @route POST /add-new-service
 * @description Add a new service for the organization
 * @access Private
 * @payload {
 *  name: string,
 *  description: string,
 *  basePrice: number,
 *  category: string,
 *  availability: boolean,
 *  estimatedDuration: string,
 *  location: { longitude: number, latitude: number },
 *  address: string,
 *  tags?: string[]
 * }
 */
router.post(
  '/add-new-service',
  verifyJWT("SERVICE_PROVIDER"),
  isAuthorized(['SERVICE_PROVIDER']),
  upload.fields([{ name: 'images', maxCount: 5 }]),
  addNewService
);

/**
 * @route POST /assign-agent
 * @description Assign an agent to a service
 * @access Private
 * @payload {
 *  agentId: string,
 *  serviceId: string
 * }
 */
router.post(
  '/assign-agent',
  verifyJWT("SERVICE_PROVIDER"),
  isAuthorized(['SERVICE_PROVIDER']),
  assignAgent
);

/**
 * @route GET /check-availability
 * @description Check availability of agents for the organization
 * @access Private
 */
router.get(
  '/agents',
  verifyJWT("SERVICE_PROVIDER"),
  isAuthorized(['SERVICE_PROVIDER']),
  availableAgents
);

/**
 * @route POST /assign-booking
 * @description Assign an agent to a booking
 * @access Private
 * @payload {
 *  agentId: string,
 *  bookingId: string
 * }
 */
router.post(
  '/assign-booking',
  verifyJWT("SERVICE_PROVIDER"),
  isAuthorized(['SERVICE_PROVIDER']),
  assignAgentForaBooking
);

/**
 * @route GET /search
 * @description Search for services
 * @access Public
 * @query {
 *  searchString?: string,
 *  latitude?: string,
 *  longitude?: string,
 *  page?: number,
 *  limit?: number
 * }
 */
router.get('/search', searchServices);

/**
 * @route GET /services
 * @description Get all services for the organization
 * @access Private
 *
 */

router.get(
  '/services',
  verifyJWT("SERVICE_PROVIDER"),
  isAuthorized(['SERVICE_PROVIDER']),
  getAllServices
);

router.delete(
  `/delete-service/:serviceId`,
  verifyJWT("SERVICE_PROVIDER"),
  isAuthorized(['SERVICE_PROVIDER']),
  deleteService
);

router.get(
  '/all-agents',
  verifyJWT("SERVICE_PROVIDER"),
  isAuthorized(['SERVICE_PROVIDER']),
  getAllAgents
);
router.delete(
  '/agent/:agentId',
  verifyJWT("SERVICE_PROVIDER"),
  isAuthorized(['SERVICE_PROVIDER']),
  deleteAgent
);

router.get(
  '/agent/:agentId',
  verifyJWT("SERVICE_PROVIDER"),
  isAuthorized(['SERVICE_PROVIDER']),
  getAgent
);

router.get(
  '/bookings',
  verifyJWT("SERVICE_PROVIDER"),
  isAuthorized(['SERVICE_PROVIDER']),
  getBookings
);
router.get(
  '/booking/:bookingId',
  verifyJWT("SERVICE_PROVIDER"),
  isAuthorized(['SERVICE_PROVIDER']),
  getBooking
  
);
/**
 * TODO: Add a route to verify an Organization using legal documents with a machine learning model
 */

export default router;
