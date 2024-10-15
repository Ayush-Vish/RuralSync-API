/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import cookieParser from 'cookie-parser';

import express from 'express';
import * as path from 'path';
import customerRoutes from './routes/customerRoutes'
import bookingRoutes from './routes/bookingRoute'
import { connectToDb } from '@org/db';


const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));


app.use(cookieParser());
app.use(express.json());



app.use('/api' ,customerRoutes);
app.use('/api',bookingRoutes);

connectToDb()
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
