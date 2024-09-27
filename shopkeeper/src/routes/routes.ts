import express from 'express';
import { getServiceProviderById, registerOrg } from '../controllers/controller';
import { isAuthorized, verifyJWT } from '@org/utils';

const router = express.Router();

router.get("/",(req , res ) => {
      return res.status(200).json({
            message: "Welcome to Shopkeeper API"
      })
} )

router.route("/:id")
      .get(getServiceProviderById);

router.post('/registerOrg' , verifyJWT ,isAuthorized(
      ["SERVICE_PROVIDER"]
) ,  registerOrg); 
export default router;