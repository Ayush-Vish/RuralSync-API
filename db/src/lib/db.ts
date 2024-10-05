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
export * from "./models/customer.model"
export * from "./models/serviceProvider.model";
export * from "./models/session.model"
export * from "./models/booking.model"
