import express from 'express'
const router = express.Router();


import {isAuthorized, verifyJWT} from '@org/utils'
import multer from 'multer'
import {getAgentDashboard,updateExtraTaskInBooking,deleteExtraTaskFromBooking,getExtraTasksForBooking,addExtraTaskToBooking} from '../controllers/agentController'
// Setup Multer for image uploads
const upload = multer({ dest: 'uploads/' });

// Agent dashboard: View all bookings
router.get('/dashboard',verifyJWT, isAuthorized(['AGENT']),getAgentDashboard);

// Add service to a booking (with image upload)
router.post('/booking/:bookingId/service',verifyJWT, upload.single('image'),addExtraTaskToBooking);

// Update a service in a booking
router.put('/service/:serviceId',verifyJWT, updateExtraTaskInBooking);

// Delete a service from a booking
router.delete('/service/:serviceId',verifyJWT, deleteExtraTaskFromBooking);

// Get all services for a specific booking
router.get('/booking/:bookingId/services',verifyJWT,getExtraTasksForBooking);

export default router;
