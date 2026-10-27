import { Schema, model } from 'mongoose';

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, trim: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true, trim: true },
  type: { type: String, required: true, trim: true },
  minutes: { type: Number, required: true, trim: true, min: 1 },
  points: { type: Number, required: true, trim: true },
  occurredAt: { type: Date, required: true, trim: true },
});

export const Activity = model('Activity', activitySchema);
