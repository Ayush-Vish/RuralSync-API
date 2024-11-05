import { verifyJWT } from '@org/utils';
import express from 'express';
import { createReview, deleteReview, getCustomerReviews, getServiceProviderReviews, updateReview } from '../controllers/review';

const router = express.Router();

// Create a new review
router.post('/reviews', verifyJWT("CLIENT"), createReview);

// Update an existing review
router.put('/reviews/:reviewId', verifyJWT("CLIENT"), updateReview);

// Get all reviews for a specific service provider
router.get('/serviceProviders/:serviceProviderId/reviews', getServiceProviderReviews);

// Delete a review
router.delete('/reviews/:reviewId', verifyJWT("CLIENT"), deleteReview);

// Get all reviews written by the authenticated customer
router.get('/customers/reviews', verifyJWT("CLIENT"), getCustomerReviews);

export default router;
