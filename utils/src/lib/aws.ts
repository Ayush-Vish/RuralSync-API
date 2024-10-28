import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();
import sharp from 'sharp';
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Utility function to upload a file to S3
 * @param {Object} file - The file object (usually req.file from multer)
 * @param {string} bucketName - The S3 bucket name
 * @returns {Promise<string>} - Returns the URL of the uploaded file
 */
export const uploadFileToS3 = async (
  file,
  bucketName = process.env.AWS_BUCKET_NAME
) => {
  if (!file || !file.buffer) {
    throw new Error('Invalid file data');
  }
  const buffer = await sharp(file.buffer)
    .resize({ height: 1920, width: 1080, fit: 'contain' })
    .toBuffer();
  const params = {
    Bucket: bucketName,
    Key: crypto.randomBytes(32).toString('hex') + file.originalname,
    Body: buffer,
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    return {
      url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('File upload failed');
  }
};
