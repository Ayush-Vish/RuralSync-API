import express from 'express'
const router = express.Router();


import {verifyJWT} from '@org/utils'
import multer from 'multer'
import {getAgentDashboard,updateServiceInBooking,deleteServiceFromBooking,getServicesForBooking,addServiceToBooking} from '../controllers/agentController'
// Setup Multer for image uploads
const upload = multer({ dest: 'uploads/' });

// Agent dashboard: View all bookings
router.get('/dashboard',verifyJWT,getAgentDashboard);

// Add service to a booking (with image upload)
router.post('/booking/:bookingId/service',verifyJWT, upload.single('image'),addServiceToBooking);

// Update a service in a booking
router.put('/service/:serviceId',verifyJWT, updateServiceInBooking);

// Delete a service from a booking
router.delete('/service/:serviceId',verifyJWT, deleteServiceFromBooking);

// Get all services for a specific booking
router.get('/booking/:bookingId/services',verifyJWT,getServicesForBooking);

export default router;
