
import express from 'express';
import * as path from 'path';
import routes from './routes/routes';
const app = express();
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use("/" ,routes );


app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to shopkeeper!' });
});


const port = process.env.PORT || 3334;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
