import { Router } from 'express';
import { getAllServices, getServiceById, getAllServiceProviders } from '../controllers/service';
import { verifyJWT, isAuthorized } from '@org/utils';

const router = Router();

router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.get('/service-provider', getAllServiceProviders);

export default router;
