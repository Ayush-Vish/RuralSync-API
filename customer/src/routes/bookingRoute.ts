import express from 'express';
import { createBooking, getBookings, deleteBooking } from '../controllers/booking';  
// import { authenticateUser } from '../middleware/authMiddleware.js';  
import {verifyJWT} from '@org/utils'

const router = express.Router();

// Route to create a booking
router.post('/bookings',verifyJWT, createBooking);

// Route to get all bookings for a customer
router.get('/bookings',verifyJWT,getBookings);

// Route to delete a booking
router.delete('/bookings/:id',verifyJWT, deleteBooking);

export default router;
