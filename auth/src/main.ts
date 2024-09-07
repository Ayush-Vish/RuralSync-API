import express from 'express';

import authRoutes from "./routes/routes";
import { connectToDb } from '@org/db';
import swaggerjsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
const app = express();
connectToDb();
const swaggerOptions = {
  swaggerDefinition: {
      openapi: '3.0.0',
      info: {
          title: 'Service Provider API',
          description: 'Employee API Information',
          contact: {
              name: 'Sagi Weizmann'
          },
      },
      servers: [
          {
              url: "http://localhost:8080/v1"
          }
      ],
  },
  apis: ['./src/api/routes/v1/*.js']
}



const swaggerDocs = swaggerjsdoc(swaggerOptions );
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.use('/auth' ,authRoutes);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
