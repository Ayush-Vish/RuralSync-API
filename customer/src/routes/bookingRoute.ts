import express from 'express';
import {
  createBooking,
  getBookings,
  deleteBooking,
  getServices,
} from '../controllers/booking';
// import { authenticateUser } from '../middleware/authMiddleware.js';
import { isAuthorized, verifyJWT } from '@org/utils';

const router = express.Router();

// Route to create a booking
router.post('/book', verifyJWT, isAuthorized(['CLIENT']), createBooking);

router.get('/services/:orgId', verifyJWT, getServices);

// Route to get all bookings for a customer
router.get('/bookings', verifyJWT, getBookings);

// Route to delete a booking
router.delete('/bookings/:id', verifyJWT, deleteBooking);

export default router;
