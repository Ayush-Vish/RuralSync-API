import express from 'express'
const router = express.Router();


import {isAuthorized, verifyJWT} from '@org/utils'
import multer from 'multer'
import {getAgentDashboard,updateExtraTaskInBooking,deleteExtraTaskFromBooking,getExtraTasksForBooking,addExtraTaskToBooking,updateBookingToInProgress,updateBookingToCompleted} from '../controllers/agentController'
// Setup Multer for image uploads
const upload = multer({ dest: 'uploads/' });

// Agent dashboard: View all bookings
router.get('/dashboard',verifyJWT, isAuthorized(['AGENT']),getAgentDashboard);

// Add service to a booking (with image upload)
router.post('/booking/:bookingId/service',verifyJWT,addExtraTaskToBooking);

// Update a service in a booking
router.put('/bookings/:bookingId/extra-task/:taskIndex', verifyJWT, updateExtraTaskInBooking);


// Delete a service from a booking
router.delete('/bookings/:bookingId/extra-task/:taskIndex', verifyJWT, deleteExtraTaskFromBooking);
// Get all services for a specific booking
router.get('/bookings/:bookingId/extra-tasks',verifyJWT , getExtraTasksForBooking);

// Route to update booking status to "In Progress"
router.put('/bookings/in-progress', verifyJWT, updateBookingToInProgress);

// Route to update booking status to "Completed"
router.put('/bookings/completed', verifyJWT, updateBookingToCompleted);


export default router;
