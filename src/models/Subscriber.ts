import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  createdAt: Date;
}

const SubscriberSchema: Schema = new Schema({
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true,
    unique: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Subscriber: Model<ISubscriber> = mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);

export default Subscriber;
