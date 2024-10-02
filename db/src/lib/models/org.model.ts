import mongoose, { Schema } from "mongoose";

const orgSchema = new Schema({
      ownerId : { type: Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
      name: { type: String, required: true },
      address: { type: String },
      phone: { type: String },
      services: [{ type: Schema.Types.ObjectId, ref: 'Service', required: false }],
      agents: [{ type: Schema.Types.ObjectId, ref: 'Agent' }],
      clients : [{ type: Schema.Types.ObjectId, ref: 'Client' }],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },

    });
    
    const Org  = mongoose.model('ServiceCompany', orgSchema);
    
    export { Org };
    