import mongoose, { Schema } from "mongoose";

const orgSchema = new Schema({
      ownerId : { type: Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
      name: { type: String, required: true },
      address: { type: String },
      phone: { type: String },
    });
    
    const Org  = mongoose.model('ServiceCompany', orgSchema);
    
    export { Org };
    