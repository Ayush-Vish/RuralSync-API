
import express from 'express';
import * as path from 'path';
import { connectToDb } from '@org/db';
import agentRoutes from '../src/routes/agentRoutes'
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser()); 
app.use(express.json())
app.use('/assets', express.static(path.join(__dirname, 'assets')));



app.use('/agent',agentRoutes);

connectToDb();

const port = 5004;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
