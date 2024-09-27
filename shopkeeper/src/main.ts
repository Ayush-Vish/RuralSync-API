
import express from 'express';
import * as path from 'path';
import routes from './routes/routes';
import cookieParser from 'cookie-parser';
import { connectToDb } from '@org/db';
import { errorMiddleware } from '@org/utils';
const app = express();
app.use('/assets', express.static(path.join(__dirname, 'assets')));
connectToDb();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/",(req , res ) => {
    return res.status(200).json({
        message: "Welcome to Shopkeeper API"
    })
    }
)


app.use("/sp" ,routes );



app.use("*" , errorMiddleware);



const port = process.env.PORT || 3332;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/sp`);
});
server.on('error', console.error);
