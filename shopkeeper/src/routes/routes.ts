import express from 'express';
import { getServiceProviderById } from '../controllers/controller';

const router = express.Router();



router.route("/:id")
      .get(getServiceProviderById);


export default router;