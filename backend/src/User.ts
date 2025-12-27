import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role?: string;
  plan?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  avatar: { type: String, default: '' },
  role: { type: String, default: 'user' },
  plan: { type: String, default: 'free' },
  subscriptionId: { type: String },
  subscriptionStatus: { type: String, default: 'inactive' },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);