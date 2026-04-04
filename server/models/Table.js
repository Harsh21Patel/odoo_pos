import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const tableSchema = new mongoose.Schema({
  number: { type: String, required: true },
  floor: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true },
  seats: { type: Number, default: 4 },
  isActive: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved'],
    default: 'available'
  },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  qrToken: { type: String, unique: true, sparse: true }
}, { timestamps: true });

// Auto-generate unique QR token if missing
tableSchema.pre('save', function(next) {
  if (!this.qrToken) {
    this.qrToken = uuidv4();
  }
  next();
});

export default mongoose.model('Table', tableSchema);