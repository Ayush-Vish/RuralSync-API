import { Router } from 'express';
import {
  agentRegister,
  getUserDetails,
  login,
  logout,
  register,
} from '../controllers/auth.controller';
import { isAuthorized, verifyJWT } from '@org/utils';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Auth API',
  });
}
);

router.post('/register', register);
router.post('/login', login);
router.post('/agent-register' , verifyJWT , isAuthorized(["SERVICE_PROVIDER"])  , agentRegister);
router.get('/logout', logout);
router.get('/userDetail', verifyJWT, getUserDetails);

export default router;
