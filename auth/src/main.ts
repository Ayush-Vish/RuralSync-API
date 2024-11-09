import express from 'express';

import authRoutes from "./routes/routes";
import { connectToDb } from '@org/db';
import { errorMiddleware } from '@org/utils';
import cookieParser from 'cookie-parser';
import cors from "cors";
const app = express();
connectToDb();
app.use(express.json());
app.use(cookieParser());
const env = process.env.NODE_ENV || 'development';

app.use(cors({
  origin: [ 'http://localhost:5173','http://localhost:5174', 'https://ruralsync-service-provider.vercel.app'],
  credentials: true
}))
app.use('/auth' ,authRoutes);
app.use("*" ,errorMiddleware )
const port =process.env.AUTH_PORT || 5001;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/auth`);
});
server.on('error', console.error);
