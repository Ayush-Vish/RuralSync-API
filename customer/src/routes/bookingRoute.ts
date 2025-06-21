import express from 'express';
import {
  createBooking,
  getCustomerBookings,
  getCustomerBookings2,
  deleteBooking,

  createBooking2,
  // getServices,
} from '../controllers/booking';
// import { authenticateUser } from '../middleware/authMiddleware.js';
import { isAuthorized, verifyJWT } from '@org/utils';

const router = express.Router();

// Route to create a booking
router.post(
  '/book',
  verifyJWT('CLIENT'),
  isAuthorized(['CLIENT']),
  createBooking
);
router.post('/book2', createBooking2);
// router.get('/services/:orgId', verifyJWT, getServices);

// Route to get all bookings for a customer
router.get(
  '/bookings',
  verifyJWT('CLIENT'),
  isAuthorized(['CLIENT']),
  getCustomerBookings
);
router.get('/bookings2/:clientId', getCustomerBookings2);

// Route to delete a booking
router.delete(
  '/bookings/:id',
  verifyJWT('CLIENT'),
  isAuthorized(['CLIENT']),
  deleteBooking
);


export default router;
