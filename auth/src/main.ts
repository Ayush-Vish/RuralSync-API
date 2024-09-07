import express from 'express';

import authRoutes from "./routes/routes";
import { connectToDb } from '@org/db';
const app = express();
connectToDb();

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to auth!' });
});

app.use('/auth' ,authRoutes);

const port = process.env.PORT || 3334;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
