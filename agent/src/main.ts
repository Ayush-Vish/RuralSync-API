
import express from 'express';
import * as path from 'path';
import { connectToDb } from '@org/db';
import agentRoutes from '../src/routes/agentRoutes'

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));



app.use('/api',agentRoutes);

connectToDb();

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
