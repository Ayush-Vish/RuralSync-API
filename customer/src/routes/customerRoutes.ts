
import express from 'express';
import { getCustomerProfile, updateCustomerProfile, changePassword } from '../controllers/profileEdit';

import {extractCustomerIdFromCookie} from '@org/middlewares'

const router = express.Router();




router.get('/customers/profile',extractCustomerIdFromCookie, getCustomerProfile);


router.put('/customers/profile',extractCustomerIdFromCookie, updateCustomerProfile);


router.patch('/customers/password',extractCustomerIdFromCookie, changePassword);

export default router;
