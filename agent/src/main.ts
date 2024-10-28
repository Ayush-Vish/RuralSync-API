
import express from 'express';
import * as path from 'path';
import { connectToDb } from '@org/db';
import agentRoutes from '../src/routes/agentRoutes'
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser()); 
app.use(express.json())
app.use('/assets', express.static(path.join(__dirname, 'assets')));
import cors from 'cors';

const env = process.env.NODE_ENV || 'development';
app.use(cors({
  origin: [ 'http://localhost:5173', 'https://ruralsync-service-provider.vercel.app'],
  credentials: true
}))

app.use('/agent',agentRoutes);

connectToDb();

const port = process.env.AGENT_PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
