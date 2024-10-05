import express from 'express';
import { createBooking, getBookings, deleteBooking } from '../controllers/booking';  
// import { authenticateUser } from '../middleware/authMiddleware.js';  
import { extractCustomerIdFromCookie } from '@org/middlewares';

const router = express.Router();

// Route to create a booking
router.post('/bookings',extractCustomerIdFromCookie, createBooking);

// Route to get all bookings for a customer
router.get('/bookings',extractCustomerIdFromCookie,getBookings);

// Route to delete a booking
router.delete('/bookings/:id',extractCustomerIdFromCookie, deleteBooking);

export default router;
