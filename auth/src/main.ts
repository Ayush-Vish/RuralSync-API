import express from 'express';

import authRoutes from "./routes/routes";
import { connectToDb } from '@org/db';
import swaggerjsdoc,{ Options } from 'swagger-jsdoc';   // Import types for swagger options
import swaggerUi from 'swagger-ui-express';
import { errorMiddleware } from '@org/utils';
import cookieParser from 'cookie-parser';
const app = express();
connectToDb();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/auth' ,authRoutes);
app.use("*" ,errorMiddleware )
const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/auth`);
});
server.on('error', console.error);
