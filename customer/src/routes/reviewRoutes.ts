import { verifyJWT } from '@org/utils';
import express from 'express';
import { createReview, deleteReview, getCustomerReviews, getServiceProviderReviews, updateReview } from '../controllers/review';

const router = express.Router();

// Create a new review
router.post('/reviews', verifyJWT, createReview);

// Update an existing review
router.put('/reviews/:reviewId', verifyJWT, updateReview);

// Get all reviews for a specific service provider
router.get('/serviceProviders/:serviceProviderId/reviews', getServiceProviderReviews);

// Delete a review
router.delete('/reviews/:reviewId', verifyJWT, deleteReview);

// Get all reviews written by the authenticated customer
router.get('/customers/reviews', verifyJWT, getCustomerReviews);

export default router;
