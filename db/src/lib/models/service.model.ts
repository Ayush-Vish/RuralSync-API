import mongoose, { Schema } from "mongoose";

const extraTaskSchema = new Schema({
  description: { type: String, required: true }, // Description of the additional task
  extraPrice: { type: Number, required: true }, // Additional cost for this task
  timeAdded: { type: String }, // Extra time needed for the task
});

const serviceSchema = new Schema({
  name: { type: String, required: true }, // e.g., "Fan Repair"
  description: { type: String, required: true }, // Detailed description of the service
  basePrice: { type: Number, required: true }, // Initial cost shown to user
  estimatedDuration: { type: String, required: true }, // Initial time estimate
  category: { type: String, required: true }, // e.g., "Home Services"
  serviceProvider: { type: Schema.Types.ObjectId, ref: 'ServiceProvider', required: true }, // Associated service provider
  serviceCompany: { type: Schema.Types.ObjectId, ref: 'Org', required: true }, // Associated service company
  availability: {
    type: [{ day: String, startTime: String, endTime: String }], // Availability slots for the service
    required: true,
  },
  finalPrice: { type: Number, default: null }, // Final price after adding extras (null initially)
  additionalTasks: [extraTaskSchema], // List of extra tasks added during service
  ratings: { type: Number, default: 0 }, // Average rating for the service
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }], // Associated reviews
  assignedAgents: [{ type: Schema.Types.ObjectId, ref: 'Agent' }], // Agents assigned to the service
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Service = mongoose.model('Service', serviceSchema);

export { Service };
 