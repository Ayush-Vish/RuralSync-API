
import express from 'express';
import * as path from 'path';
import routes from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerjsdoc from 'swagger-jsdoc'
const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));
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
app.use("/" ,routes );






const port = process.env.PORT || 3334;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
