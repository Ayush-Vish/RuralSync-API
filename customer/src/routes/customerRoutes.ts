
import express from 'express';
import { getCustomerProfile, updateCustomerProfile, changePassword } from '../controllers/profileEdit';

// import {extractCustomerIdFromCookie} from '@org/middlewares'
import {verifyJWT} from '@org/utils'

const router = express.Router();




router.get('/customers/profile',verifyJWT("CLIENT"), getCustomerProfile);


router.put('/customers/profile-update',verifyJWT("CLIENT"), updateCustomerProfile);


router.patch('/customers/password',verifyJWT("CLIENT"), changePassword);

export default router;
