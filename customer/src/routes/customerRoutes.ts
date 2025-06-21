
import express from 'express';
import { getCustomerProfile, updateCustomerProfile, changePassword } from '../controllers/profileEdit';

// import {extractCustomerIdFromCookie} from '@org/middlewares'
import {verifyJWT} from '@org/utils'

const router = express.Router();

router.get('/', (req, res) => {
  res.send({ message: 'Welcome to customer profile routes!' });
});


router.get('/profile',verifyJWT("CLIENT"), getCustomerProfile);


router.put('/profile-update',verifyJWT("CLIENT"), updateCustomerProfile);


router.patch('/password',verifyJWT("CLIENT"), changePassword);

export default router;
