/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import cookieParser from 'cookie-parser';

import express from 'express';
import * as path from 'path';
import routes from './routes/customerRoutes'
import { connectToDb } from '@org/db';

const app = express();
import cors from 'cors';
const env = process.env.NODE_ENV || 'development';
app.use(cors({
  origin: [ 'http://localhost:5173','http://localhost:5174', "http://localhost:5175","http://localhost:3000" , 'https://ruralsync-service-provider.vercel.app'],
  credentials: true
}))
app.use('/assets', express.static(path.join(__dirname, 'assets')));


app.use(cookieParser());
app.use(express.json());


app.use('/customer', routes);

connectToDb()
const port = process.env.CUSTOMER_PORT || 5002;
const server = app.listen(port, () => {
  console.log(`Listening at ${process.env.LOCAL_DOMAIN}:${port}`);
});
server.on('error', console.error);
