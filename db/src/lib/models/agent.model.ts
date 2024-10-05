import mongoose from "mongoose";

const { Schema } = mongoose;

const agentSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    clients: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
    serviceProvider: { type: Schema.Types.ObjectId, ref: 'ServiceProvider' },
    ip: { type: String },
    refreshToken: { type: String }, 
    createdAt: { type: Date, default: Date.now }
});

export const Agent = mongoose.model('Agent', agentSchema);


