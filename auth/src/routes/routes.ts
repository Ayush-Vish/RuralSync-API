import { Router } from 'express';
import {
  
  agentRegister,
  getUserDetails,
  login,
  logout,
  register,
} from '../controllers/auth.controller';
import { isAuthorized, loactionMiddleware,  upload, uploadFileToS3, verifyJWT } from '@org/utils';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Auth API',
  });
});

router.post('/register', register);
router.post('/login', loactionMiddleware,   login);
router.post(
  '/agent-register',
  verifyJWT,
  isAuthorized(['SERVICE_PROVIDER']),
  agentRegister
);
router.get('/logout', logout);
router.get('/user-detail', verifyJWT, getUserDetails);
router.post('/upload', upload.single('file'),async (req, res) => {
  // Check if the file was uploaded successfully
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const {url}  = await uploadFileToS3(req.file);
  return res.status(200).json({ 
    url,
    message: 'File uploaded successfully',
  });


});
export default router;
