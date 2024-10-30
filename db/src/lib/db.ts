import mongoose from "mongoose";
import { config } from "dotenv";
config();
export function db(): string {
  return 'db';
}

export async function connectToDb() {
  await mongoose.connect(process.env.MONGO_URI as string)
    .then(()=>{
      console.log("Connected to database")
    })
    .catch((err ) => {
      console.log("Error connecting to database", err)
      process.exit(1)
    })
}


export * from "./models/agent.model"
export * from "./models/client.model"
export * from "./models/serviceProvider.model";
export * from "./models/session.model"
export * from "./models/org.model"
export * from "./models/service.model";
export * from "./models/review.model";
export * from "./models/booking.model";
export * from "./models/serviceItem.model"
export * from "./models/auditLog.model"