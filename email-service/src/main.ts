

import express from 'express';
import * as path from 'path';
import emailRoutes from './routes/routes';
import { connectToDb } from '@org/db';
const app = express();
import dotenv from 'dotenv';
import bodyparser from 'body-parser';
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
connectToDb()
dotenv.config();
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(express.json());
app.get('/email', (req, res) => {
  res.send({ message: 'Welcome to email-service!' });
});

app.use("/email-service" ,emailRoutes  );

const port = process.env.EMAIL_PORT || 5005;
const server = app.listen(port, () => {
  console.log(`Listening at ${process.env.LOCAL_DOMAIN}:${port}/email`);
});
server.on('error', console.error);
