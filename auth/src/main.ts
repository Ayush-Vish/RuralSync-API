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
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}))
app.use('/auth' ,authRoutes);
app.use("*" ,errorMiddleware )
const port =process.env.AUTH_PORT || 5001;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/auth`);
});
server.on('error', console.error);
