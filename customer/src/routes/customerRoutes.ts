
import express from 'express';
import { getCustomerProfile, updateCustomerProfile, changePassword } from '../controllers/profileEdit';

// import {extractCustomerIdFromCookie} from '@org/middlewares'
import {verifyJWT} from '@org/utils'

const router = express.Router();




router.get('/customers/profile',verifyJWT, getCustomerProfile);


router.put('/customers/profile',verifyJWT, updateCustomerProfile);


router.patch('/customers/password',verifyJWT, changePassword);

export default router;
