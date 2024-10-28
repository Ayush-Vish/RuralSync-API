import express from 'express';

import authRoutes from "./routes/routes";
import { connectToDb } from '@org/db';
import swaggerjsdoc,{ Options } from 'swagger-jsdoc';   // Import types for swagger options
import swaggerUi from 'swagger-ui-express';
import { errorMiddleware } from '@org/utils';
import cookieParser from 'cookie-parser';
import cors from "cors";
const app = express();
connectToDb();
app.use(express.json());
app.use(cookieParser());
const env = process.env.NODE_ENV || 'development';
app.use(cors({
  origin: env === 'development' ? 'http://localhost:5173' : 'https://ruralsync-service-provider.vercel.app',
  credentials: true
}))
app.use('/auth' ,authRoutes);
app.use("*" ,errorMiddleware )
const port =process.env.AUTH_PORT || 5001;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/auth`);
});
server.on('error', console.error);
