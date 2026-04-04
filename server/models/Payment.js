import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash', 'digital', 'upi'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  upiTransactionId: String,
  cashReceived: Number,
  changeGiven: Number,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);