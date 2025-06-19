/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { connectToDb, RequestWithUser } from '@org/db';
import { ApiError, errorMiddleware, isAuthorized, verifyJWT } from '@org/utils';
import AuditLog from 'db/src/lib/models/auditLog.model';
import express  ,{Request, Response , NextFunction }from 'express';
import * as path from 'path';
import cookieParser from 'cookie-parser';
import cors from "cors"
const app = express();
connectToDb();
app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
import dotenv from 'dotenv';
dotenv.config();
app.use(cors({
  origin: [ 'http://localhost:5173','http://localhost:5174', "http://localhost:5175", 'https://ruralsync-service-provider.vercel.app'],
  credentials: true
}))
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to audit-log!' });
});

app.post("/audit-log/create" , async(req : Request, res : Response , next : NextFunction) => {
  try {
    const {
      userId,username, role, action, targetId, metadata , serviceProviderId
    } = req.body;
    console.log("Audit Log Data", req.body)
    await AuditLog.create({
      userId,
      role,
      action,
      targetId,
      metadata,
      serviceProviderId,
      username
    })
    return res.status(200).json({message : "Audit Log Created Successfully"})

  } catch (error) {
    return next(new ApiError("Failed to create Audit Log " + error.message , 400))
  }
});

app.get("/audit-log" , verifyJWT("SERVICE_PROVIDER") , isAuthorized(["SERVICE_PROVIDER"]) , async(req : RequestWithUser, res : Response , next : NextFunction) => {
  try {
      const serviceProviderId = req.user.id;

    const logs = await AuditLog.find({
      serviceProviderId
    });
    return res.status(200).json({message : "Audit Log Fetched Successfully" , data : logs})
  } catch (error) {
    return next(new ApiError("Failed to fetch Audit Log " + error.message , 400))
  }
})

app.use(errorMiddleware);

const port = process.env.AUDIT_PORT || 5006;
const server = app.listen(port, () => {
  console.log(`Listening at ${process.env.LOCAL_DOMAIN}:${port}/audit-log`);
});
server.on('error', console.error);
