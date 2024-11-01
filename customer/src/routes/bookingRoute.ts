import express from 'express';
import {
  createBooking,
  getCustomerBookings,
  deleteBooking,
  getAllServices,
  getAllServiceProviders,
  // getServices,
} from '../controllers/booking';
// import { authenticateUser } from '../middleware/authMiddleware.js';
import { isAuthorized, verifyJWT } from '@org/utils';

const router = express.Router();

// Route to create a booking
router.post('/book', verifyJWT, isAuthorized(['CLIENT']), createBooking);

// router.get('/services/:orgId', verifyJWT, getServices);

// Route to get all bookings for a customer
router.get('/bookings', verifyJWT,isAuthorized(['CLIENT']),getCustomerBookings);

// Route to delete a booking
router.delete('/bookings/:id', verifyJWT,isAuthorized(['CLIENT']),deleteBooking);

router.get('/services',verifyJWT,getAllServices)
router.get('/service-provider',verifyJWT,getAllServiceProviders);

export default router;
