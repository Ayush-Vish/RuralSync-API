

import express from 'express';
import * as path from 'path';
import emailRoutes from './routes/routes';
const app = express();
import dotenv from 'dotenv';
import bodyparser from 'body-parser';
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

dotenv.config();
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(express.json());
app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to email-service!' });
});

app.use("/email" ,emailRoutes  );

const port =5005;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
